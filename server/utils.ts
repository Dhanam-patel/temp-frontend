/**
 * Generates a unique Login ID based on company name, employee name, and join year
 * Format: [C1C2][F1F2][L1L2][YYYY][SN]
 * Example: OIJODO20220001 (Odoo India, Jane Doe, 2022, Serial 1)
 */
export function generateLoginId(
    companyName: string,
    firstName: string,
    lastName: string,
    year: number,
    serialNumber: number
): string {
    // Extract first 2 letters of company name (uppercase)
    const companyCode = companyName.substring(0, 2).toUpperCase().padEnd(2, 'X');

    // Extract first 2 letters of first name (uppercase)
    const firstNameCode = firstName.substring(0, 2).toUpperCase().padEnd(2, 'X');

    // Extract first 2 letters of last name (uppercase)
    const lastNameCode = lastName.substring(0, 2).toUpperCase().padEnd(2, 'X');

    // Format serial number as 4-digit zero-padded string
    const serialCode = serialNumber.toString().padStart(4, '0');

    return `${companyCode}${firstNameCode}${lastNameCode}${year}${serialCode}`;
}

/**
 * Generates a temporary password for new employees
 * Format: Temp + 4 random digits + !
 */
export function generateTempPassword(): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `Temp${randomDigits}!`;
}

/**
 * Parses full name into first and last name
 */
export function parseFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || parts[0] || '';
    return { firstName, lastName };
}
