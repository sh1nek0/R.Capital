import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { UserRole } from "@capital-os/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthTokenService } from "./auth-token.service";
import type { AuthResponse, AuthUserView } from "./auth.types";
import { BootstrapAdminDto } from "./dto/bootstrap-admin.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterFounderDto } from "./dto/register-founder.dto";
import { PasswordService } from "./password.service";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly authTokenService: AuthTokenService
  ) {}

  async registerFounder(dto: RegisterFounderDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    await this.assertEmailIsFree(email);

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        telegram: dto.telegram,
        phone: dto.phone,
        role: "founder",
        passwordHash
      }
    });

    return this.authResponse(this.toUserView(user as UserRecord));
  }

  async bootstrapAdmin(dto: BootstrapAdminDto): Promise<AuthResponse> {
    const expectedToken = this.config.get<string>("ADMIN_BOOTSTRAP_TOKEN");
    if (!expectedToken || dto.bootstrapToken !== expectedToken) {
      throw new UnauthorizedException("Invalid bootstrap token");
    }

    const existingAdmin = await this.prisma.user.findFirst({
      where: {
        role: "admin"
      }
    });

    if (existingAdmin) {
      throw new BadRequestException("Admin user already exists");
    }

    const email = this.normalizeEmail(dto.email);
    await this.assertEmailIsFree(email);

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        role: "admin",
        passwordHash
      }
    });

    return this.authResponse(this.toUserView(user as UserRecord));
  }

  async ensureFirstAdmin(dto: CreateAdminDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const existingAdmin = (await this.prisma.user.findFirst({
      where: {
        role: "admin"
      }
    })) as UserRecord | null;

    if (existingAdmin) {
      if (existingAdmin.email === email && existingAdmin.passwordHash) {
        const isValid = await this.passwordService.verify(
          dto.password,
          existingAdmin.passwordHash
        );

        if (isValid) {
          return this.authResponse(this.toUserView(existingAdmin));
        }
      }

      throw new BadRequestException(
        "Admin user already exists. Sign in as admin to add more admins."
      );
    }

    await this.assertEmailIsFree(email);

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        role: "admin",
        passwordHash
      }
    });

    return this.authResponse(this.toUserView(user as UserRecord));
  }

  async createAdmin(dto: CreateAdminDto): Promise<AuthUserView> {
    const email = this.normalizeEmail(dto.email);
    await this.assertEmailIsFree(email);

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        role: "admin",
        passwordHash
      }
    });

    return this.toUserView(user as UserRecord);
  }

  async listAdmins(): Promise<AuthUserView[]> {
    const users = (await this.prisma.user.findMany({
      where: {
        role: "admin"
      },
      orderBy: {
        createdAt: "asc"
      }
    })) as UserRecord[];

    return users.map((user) => this.toUserView(user));
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const user = (await this.prisma.user.findUnique({
      where: {
        email
      }
    })) as UserRecord | null;

    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isValid = await this.passwordService.verify(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.authResponse(this.toUserView(user));
  }

  async me(userId: string): Promise<AuthUserView> {
    const user = (await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    })) as UserRecord | null;

    if (!user) {
      throw new UnauthorizedException("User does not exist");
    }

    return this.toUserView(user);
  }

  private authResponse(user: AuthUserView): AuthResponse {
    return {
      accessToken: this.authTokenService.sign(user),
      user
    };
  }

  private async assertEmailIsFree(email: string) {
    const existing = await this.prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existing) {
      throw new ConflictException("Email is already registered");
    }
  }

  private toUserView(user: UserRecord): AuthUserView {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
