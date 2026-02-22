export class UpdateOrganizationDto {
  name?: string;
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  social_media?: Record<string, string>;
}
