import { ValidationError } from 'class-validator';

const FIELDS: Record<string, string> = {
  name: 'Nume', fullName: 'Nume complet', email: 'Adresă de e-mail', password: 'Parolă',
  currentPassword: 'Parola actuală', newPassword: 'Parola nouă', kindergartenId: 'Grădiniță',
  groupId: 'Grupă', location: 'Adresă', age: 'Vârstă', role: 'Rol', page: 'Pagină', limit: 'Număr de rezultate',
  search: 'Căutare', message: 'Mesaj', startDate: 'Data de început', endDate: 'Data de sfârșit',
  style: 'Stil', global: 'Setări', action: 'Acțiune', entityType: 'Tipul înregistrării',
};

export function validationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap(error => {
    const label = FIELDS[error.property] ?? 'Câmp';
    const messages = Object.entries(error.constraints ?? {}).map(([rule, original]) => {
      const number = original.match(/(?:than|least) (\d+)/)?.[1];
      switch (rule) {
        case 'isEmail': return `${label}: introdu o adresă de e-mail validă.`;
        case 'isMongoId': return `${label}: alege o înregistrare validă.`;
        case 'isString': return `${label}: introdu un text valid.`;
        case 'isNotEmpty': return `${label}: acest câmp este obligatoriu.`;
        case 'isInt': return `${label}: introdu un număr întreg.`;
        case 'min': return `${label}: valoarea minimă este ${number ?? 0}.`;
        case 'max': return `${label}: valoarea maximă este ${number ?? 0}.`;
        case 'minLength': return `${label}: introdu cel puțin ${number ?? 8} caractere.`;
        case 'maxLength': return `${label}: textul introdus este prea lung.`;
        case 'isLength': return `${label}: introdu un text cu o lungime validă.`;
        case 'isIn': case 'isEnum': return `${label}: alege una dintre opțiunile disponibile.`;
        case 'isDateString': case 'isDate': return `${label}: introdu o dată validă.`;
        case 'isObject': return `${label}: introdu un obiect valid.`;
        default: return `${label}: valoarea introdusă este invalidă.`;
      }
    });
    return [...messages, ...validationMessages(error.children ?? [])];
  });
}
