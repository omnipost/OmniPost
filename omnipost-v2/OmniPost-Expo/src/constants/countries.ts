export interface CountryOption {
  name: string;
  iso2: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  { name: 'India', iso2: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', iso2: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', iso2: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', iso2: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', iso2: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Germany', iso2: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', iso2: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Brazil', iso2: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Nigeria', iso2: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Mexico', iso2: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Spain', iso2: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Italy', iso2: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Japan', iso2: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'South Korea', iso2: 'KR', dialCode: '+82', flag: '🇰🇷' },
  { name: 'Singapore', iso2: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'United Arab Emirates', iso2: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', iso2: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'South Africa', iso2: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Netherlands', iso2: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Sweden', iso2: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Turkey', iso2: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Indonesia', iso2: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Philippines', iso2: 'PH', dialCode: '+63', flag: '🇵🇭' },
  { name: 'New Zealand', iso2: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Thailand', iso2: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Malaysia', iso2: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Vietnam', iso2: 'VN', dialCode: '+84', flag: '🇻🇳' },
  { name: 'Egypt', iso2: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Argentina', iso2: 'AR', dialCode: '+54', flag: '🇦🇷' },
];
