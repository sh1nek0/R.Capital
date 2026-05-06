import { IsArray, IsEmail, IsOptional, IsString } from "class-validator";

export class SubmitQuestionnaireDto {
  @IsString()
  founderName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsString()
  startupName!: string;

  @IsString()
  description!: string;

  @IsString()
  industry!: string;

  @IsOptional()
  @IsString()
  clientType?: string;

  @IsOptional()
  @IsString()
  businessModel?: string;

  @IsString()
  stage!: string;

  @IsString()
  revenueRange!: string;

  @IsOptional()
  @IsString()
  teamSize?: string;

  @IsOptional()
  @IsArray()
  tractionSignals?: string[];

  @IsString()
  fundingNeedAmount!: string;

  @IsOptional()
  @IsString()
  fundingNeedPurpose?: string;

  @IsOptional()
  @IsArray()
  preferredFundingTypes?: string[];

  @IsOptional()
  @IsString()
  previousFundingAttempts?: string;

  @IsArray()
  preparedDocuments!: string[];

  @IsString()
  mainPain!: string;
}
