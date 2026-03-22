import re
import difflib


ERROR_PATTERNS = {
    'article': [
        (r'\ba\s+[aeiou]', 'Use "an" before vowel sounds'),
        (r'\ban\s+[^aeiou\s]', 'Use "a" before consonant sounds'),
    ],
    'tense': [
        (r'\byesterday\b.+\b(is|are|am)\b', 'Use past tense with "yesterday"'),
        (r'\btomorrow\b.+\b(was|were)\b', 'Use future tense with "tomorrow"'),
    ],
    'subject_verb': [
        (r'\bhe\s+have\b', '"He" requires "has"'),
        (r'\bshe\s+have\b', '"She" requires "has"'),
        (r'\bthey\s+has\b', '"They" requires "have"'),
        (r'\bwe\s+has\b', '"We" requires "have"'),
    ],
}


def detect_errors(text):
    errors = []
    text_lower = text.lower()
    for error_type, patterns in ERROR_PATTERNS.items():
        for pattern, message in patterns:
            if re.search(pattern, text_lower):
                errors.append({
                    'type': error_type,
                    'message': message,
                })
    return errors


def compute_similarity(a, b):
    return difflib.SequenceMatcher(None, a.lower(), b.lower()).ratio()


def analyze_answer(user_answer, correct_answer, exercise_type):
    similarity = compute_similarity(user_answer, correct_answer)
    is_correct = similarity >= 0.9
    errors = detect_errors(user_answer)

    if is_correct:
        feedback = 'Excellent! Your answer is correct.'
    elif similarity >= 0.7:
        feedback = f'Almost there! Your answer is {round(similarity*100)}% similar.'
    elif errors:
        error_types = list({e['type'] for e in errors})
        feedback = f'Review these areas: {", ".join(error_types)}.'
    else:
        feedback = 'Incorrect. Review the topic and try again.'

    return {
        'is_correct': is_correct,
        'similarity_score': round(similarity, 3),
        'errors': errors,
        'feedback': feedback,
    }


def update_weakness_from_errors(user, errors):
    from progress.models import Weakness
    for error in errors:
        error_type = error.get('type', 'other')
        weakness, created = Weakness.objects.get_or_create(
            user=user, error_type=error_type
        )
        if not created:
            weakness.frequency += 1
            weakness.save(update_fields=['frequency', 'last_occurred'])