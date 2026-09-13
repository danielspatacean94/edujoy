// Native form validation follows the application's language, not the browser's.
export function installRomanianValidation() {
  const isField = (target: EventTarget | null): target is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
    target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement
  document.addEventListener('invalid', event => {
    if (!isField(event.target)) return
    const field = event.target
    field.setCustomValidity('')
    const validity = field.validity
    if (validity.valueMissing) field.setCustomValidity('Completează acest câmp.')
    else if (validity.typeMismatch) field.setCustomValidity('Introdu o adresă validă.')
    else if (validity.rangeUnderflow && field instanceof HTMLInputElement) field.setCustomValidity(`Valoarea minimă este ${field.min}.`)
    else if (validity.rangeOverflow && field instanceof HTMLInputElement) field.setCustomValidity(`Valoarea maximă este ${field.max}.`)
    else if (validity.tooShort && 'minLength' in field) field.setCustomValidity(`Introdu cel puțin ${field.minLength} caractere.`)
    else if (validity.tooLong && 'maxLength' in field) field.setCustomValidity(`Introdu cel mult ${field.maxLength} caractere.`)
    else if (validity.stepMismatch) field.setCustomValidity('Introdu o valoare validă, respectând pasul indicat.')
    else if (!validity.valid) field.setCustomValidity('Verifică valoarea introdusă.')
  }, true)
  for (const event of ['input', 'change']) document.addEventListener(event, e => {
    if (isField(e.target)) e.target.setCustomValidity('')
  })
}
