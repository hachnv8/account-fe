import { EventInput } from '@fullcalendar/core';
export type externalModel = {
    id: number
    textClass: string
    className: string
    title: string
}

let eventGuid = 0;
export function createEventId() {
    return String(eventGuid++);
}

const category = [
    {
        name: 'Danger',
        value: 'bg-danger'
    },
    {
        name: 'Success',
        value: 'bg-success'
    },
    {
        name: 'Primary',
        value: 'bg-primary'
    },
    {
        name: 'Info',
        value: 'bg-info'
    },
    {
        name: 'Dark',
        value: 'bg-dark'
    },
    {
        name: 'Warning',
        value: 'bg-warning'
    },
];

const calendarEvents: EventInput[] = [
    {
        id: createEventId(),
        title: 'Meeting',
        start: new Date().setDate(new Date().getDate() + 1),
        end: new Date().setDate(new Date().getDate() + 2),
        className: 'bg-warning text-white',
    },
    {
        id: createEventId(),
        title: 'Lunch',
        start: new Date(),
        end: new Date(),
        className: 'bg-success text-white',
    },
    {
        id: createEventId(),
        title: 'Birthday - party',
        start: new Date().setDate(new Date().getDate() + 8),
        className: 'bg-info text-white',
    },
    {
        id: createEventId(),
        title: 'Long Event',
        start: new Date().setDate(new Date().getDate() + 7),
        end: new Date().setDate(new Date().getDate() + 8),
        className: 'bg-primary text-white'
    }
];

const localeList = [
    { code: 'en', name: 'English' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ar-dz', name: 'Arabic (Algeria)' },
    { code: 'ar-kw', name: 'Arabic (Kuwait)' },
    { code: 'ar-ly', name: 'Arabic (Libya)' },
    { code: 'ar-ma', name: 'Arabic (Morocco)' },
    { code: 'ar-sa', name: 'Arabic (Saudi Arabia)' },
    { code: 'ar-tn', name: 'Arabic (Tunisia)' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'ca', name: 'Catalan' },
    { code: 'cs', name: 'Czech' },
    { code: 'cy', name: 'Welsh' },
    { code: 'da', name: 'Danish' },
    { code: 'de', name: 'German' },
    { code: 'de-at', name: 'German (Austria)' },
    { code: 'el', name: 'Greek' },
    { code: 'en-au', name: 'English (Australia)' },
    { code: 'en-gb', name: 'English (UK)' },
    { code: 'en-nz', name: 'English (New Zealand)' },
    { code: 'eo', name: 'Esperanto' },
    { code: 'es', name: 'Spanish' },
    { code: 'et', name: 'Estonian' },
    { code: 'eu', name: 'Basque' },
    { code: 'fa', name: 'Persian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'fr-ch', name: 'French (Switzerland)' },
    { code: 'gl', name: 'Galician' },
    { code: 'he', name: 'Hebrew' },
    { code: 'hi', name: 'Hindi' },
    { code: 'hr', name: 'Croatian' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'hy-am', name: 'Armenian' },
    { code: 'id', name: 'Indonesian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ka', name: 'Georgian' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'km', name: 'Khmer' },
    { code: 'ko', name: 'Korean' },
    { code: 'ku', name: 'Kurdish' },
    { code: 'lb', name: 'Luxembourgish' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'ms', name: 'Malay' },
    { code: 'nb', name: 'Norwegian (Bokmål)' },
    { code: 'ne', name: 'Nepali' },
    { code: 'nl', name: 'Dutch' },
    { code: 'nn', name: 'Norwegian (Nynorsk)' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'pt-br', name: 'Portuguese (Brazil)' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'si-lk', name: 'Sinhala' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'sm', name: 'Samoan' },
    { code: 'sq', name: 'Albanian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'sr-cyrl', name: 'Serbian (Cyrillic)' },
    { code: 'sv', name: 'Swedish' },
    { code: 'ta-in', name: 'Tamil' },
    { code: 'th', name: 'Thai' },
    { code: 'tr', name: 'Turkish' },
    { code: 'ug', name: 'Uyghur' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'uz', name: 'Uzbek' },
    { code: 'uz-cy', name: 'Uzbek (Cyrillic)' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'zh-cn', name: 'Chinese (Simplified)' },
    { code: 'zh-tw', name: 'Chinese (Traditional)' },
];
const externalEvents: externalModel[] = [
    {
        id: 1,
        textClass: 'text-white',
        className: 'success',
        title: 'New Event Planing ',
    },
    {
        id: 2,
        textClass: 'text-white',
        className: 'info',
        title: 'Meeting',
    },
    {
        id: 3,
        textClass: 'text-white',
        className: 'warning',
        title: 'Generating Reports',
    },
    {
        id: 4,
        textClass: 'text-white',
        className: 'danger',
        title: 'Create New theme',
    },
]
export { category, calendarEvents, localeList, externalEvents };
