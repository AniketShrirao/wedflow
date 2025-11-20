/**
 * Internationalization support for error messages
 * This provides a foundation for multi-language error messages
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh'

export interface ErrorMessageTranslations {
    required: string
    invalid: string
    tooShort: string
    tooLong: string
    invalidEmail: string
    invalidUrl: string
    invalidPhone: string
    invalidDate: string
    invalidTime: string
    invalidUPI: string
    minLength: (min: number) => string
    maxLength: (max: number) => string
    between: (min: number, max: number) => string
    custom: (message: string) => string
}

const translations: Record<Language, ErrorMessageTranslations> = {
    en: {
        required: 'This field is required',
        invalid: 'Invalid value',
        tooShort: 'Value is too short',
        tooLong: 'Value is too long',
        invalidEmail: 'Please enter a valid email address',
        invalidUrl: 'Please enter a valid URL',
        invalidPhone: 'Please enter a valid phone number',
        invalidDate: 'Please enter a valid date',
        invalidTime: 'Please enter a valid time (HH:MM)',
        invalidUPI: 'Please enter a valid UPI ID (e.g., name@bank)',
        minLength: (min) => `Must be at least ${min} characters`,
        maxLength: (max) => `Must be no more than ${max} characters`,
        between: (min, max) => `Must be between ${min} and ${max} characters`,
        custom: (message) => message
    },
    es: {
        required: 'Este campo es obligatorio',
        invalid: 'Valor inválido',
        tooShort: 'El valor es demasiado corto',
        tooLong: 'El valor es demasiado largo',
        invalidEmail: 'Por favor ingrese un correo electrónico válido',
        invalidUrl: 'Por favor ingrese una URL válida',
        invalidPhone: 'Por favor ingrese un número de teléfono válido',
        invalidDate: 'Por favor ingrese una fecha válida',
        invalidTime: 'Por favor ingrese una hora válida (HH:MM)',
        invalidUPI: 'Por favor ingrese un ID UPI válido (ej: nombre@banco)',
        minLength: (min) => `Debe tener al menos ${min} caracteres`,
        maxLength: (max) => `No debe tener más de ${max} caracteres`,
        between: (min, max) => `Debe tener entre ${min} y ${max} caracteres`,
        custom: (message) => message
    },
    fr: {
        required: 'Ce champ est requis',
        invalid: 'Valeur invalide',
        tooShort: 'La valeur est trop courte',
        tooLong: 'La valeur est trop longue',
        invalidEmail: 'Veuillez entrer une adresse e-mail valide',
        invalidUrl: 'Veuillez entrer une URL valide',
        invalidPhone: 'Veuillez entrer un numéro de téléphone valide',
        invalidDate: 'Veuillez entrer une date valide',
        invalidTime: 'Veuillez entrer une heure valide (HH:MM)',
        invalidUPI: 'Veuillez entrer un ID UPI valide (ex: nom@banque)',
        minLength: (min) => `Doit contenir au moins ${min} caractères`,
        maxLength: (max) => `Ne doit pas dépasser ${max} caractères`,
        between: (min, max) => `Doit contenir entre ${min} et ${max} caractères`,
        custom: (message) => message
    },
    de: {
        required: 'Dieses Feld ist erforderlich',
        invalid: 'Ungültiger Wert',
        tooShort: 'Der Wert ist zu kurz',
        tooLong: 'Der Wert ist zu lang',
        invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
        invalidUrl: 'Bitte geben Sie eine gültige URL ein',
        invalidPhone: 'Bitte geben Sie eine gültige Telefonnummer ein',
        invalidDate: 'Bitte geben Sie ein gültiges Datum ein',
        invalidTime: 'Bitte geben Sie eine gültige Uhrzeit ein (HH:MM)',
        invalidUPI: 'Bitte geben Sie eine gültige UPI-ID ein (z.B. name@bank)',
        minLength: (min) => `Muss mindestens ${min} Zeichen lang sein`,
        maxLength: (max) => `Darf nicht mehr als ${max} Zeichen lang sein`,
        between: (min, max) => `Muss zwischen ${min} und ${max} Zeichen lang sein`,
        custom: (message) => message
    },
    hi: {
        required: 'यह फ़ील्ड आवश्यक है',
        invalid: 'अमान्य मान',
        tooShort: 'मान बहुत छोटा है',
        tooLong: 'मान बहुत लंबा है',
        invalidEmail: 'कृपया एक मान्य ईमेल पता दर्ज करें',
        invalidUrl: 'कृपया एक मान्य URL दर्ज करें',
        invalidPhone: 'कृपया एक मान्य फ़ोन नंबर दर्ज करें',
        invalidDate: 'कृपया एक मान्य तिथि दर्ज करें',
        invalidTime: 'कृपया एक मान्य समय दर्ज करें (HH:MM)',
        invalidUPI: 'कृपया एक मान्य UPI ID दर्ज करें (जैसे: नाम@बैंक)',
        minLength: (min) => `कम से कम ${min} वर्ण होने चाहिए`,
        maxLength: (max) => `${max} वर्णों से अधिक नहीं होना चाहिए`,
        between: (min, max) => `${min} और ${max} वर्णों के बीच होना चाहिए`,
        custom: (message) => message
    },
    zh: {
        required: '此字段为必填项',
        invalid: '无效值',
        tooShort: '值太短',
        tooLong: '值太长',
        invalidEmail: '请输入有效的电子邮件地址',
        invalidUrl: '请输入有效的URL',
        invalidPhone: '请输入有效的电话号码',
        invalidDate: '请输入有效的日期',
        invalidTime: '请输入有效的时间 (HH:MM)',
        invalidUPI: '请输入有效的UPI ID (例如: name@bank)',
        minLength: (min) => `必须至少包含 ${min} 个字符`,
        maxLength: (max) => `不得超过 ${max} 个字符`,
        between: (min, max) => `必须在 ${min} 到 ${max} 个字符之间`,
        custom: (message) => message
    }
}

let currentLanguage: Language = 'en'

export function setLanguage(language: Language): void {
    currentLanguage = language
}

export function getLanguage(): Language {
    return currentLanguage
}

export function getErrorMessage(key: keyof ErrorMessageTranslations, ...args: number[]): string {
    const translation = translations[currentLanguage][key]

    if (typeof translation === 'function') {
        return (translation as (...args: number[]) => string)(...args)
    }

    return translation as string
}

export function translateErrorMessage(message: string, language?: Language): string {
    const lang = language || currentLanguage
    const t = translations[lang]

    // Try to match common error patterns and translate them
    if (message.includes('required')) return t.required
    if (message.includes('invalid email')) return t.invalidEmail
    if (message.includes('invalid url')) return t.invalidUrl
    if (message.includes('invalid phone')) return t.invalidPhone
    if (message.includes('invalid date')) return t.invalidDate
    if (message.includes('invalid time')) return t.invalidTime
    if (message.includes('invalid UPI')) return t.invalidUPI

    // If no match, return original message
    return message
}

export { translations }
