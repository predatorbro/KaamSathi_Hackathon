import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { ENV } from '../constants/env.constants';
import { Users } from '../entities/user.entity';
import { ObjectId } from 'mongodb';

const userRepository = AppDataSource.getMongoRepository(Users);

export class AuthService {
    private static readonly SALT_ROUNDS = 10;
    private static readonly JWT_SECRET = ENV.JWT_SECRET || 'your-secret-key';
    private static readonly JWT_EXPIRES_IN = '30d';

    static async register(userData: {
        email: string;
        password: string;
        name: string;
        phoneNumber: string;
        role?: 'user' | 'admin';
    }): Promise<Users> {
        // Check if email or phone already exists
        const existingUser = await userRepository.findOne({
            where: {
                $or: [
                    { email: userData.email },
                    { phoneNumber: userData.phoneNumber }
                ]
            }
        });

        if (existingUser) {
            throw new Error('Email or phone number already in use');
        }

        const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

        const user = new Users();
        user.email = userData.email;
        user.password = hashedPassword;
        user.name = userData.name;
        user.phoneNumber = userData.phoneNumber;
        user.role = userData.role || 'user';

        return await userRepository.save(user);
    }

    static async login(email: string, password: string): Promise<{ user: Users; token: string }> {
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );

        return { user, token };
    }

    static async verifyToken(token: string): Promise<Users | null> {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as { id: string };
            const user = await userRepository.findOne({ where: { _id: new ObjectId(decoded.id) } });
            return user || null;
        } catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
    }

    static async getUserById(id: ObjectId): Promise<Users | null> {
        return await userRepository.findOne({ where: { _id: id } });
    }
}