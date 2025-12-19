import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../model/user.model.js';
import config from './config.js';

if (config.google.clientId && config.google.clientSecret) {
    passport.use(new GoogleStrategy({
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists by Google ID
            let user = await User.findOne({ googleId: profile.id });
            if (user) return done(null, user);
            // Check if email already exists (link accounts)
            const email = profile.emails?.[0]?.value;
            if (email) {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    existingUser.googleId = profile.id;
                    existingUser.name = profile.displayName;
                    // @ts-ignore
                    existingUser.avatar = profile.photos?.[0]?.value;
                    await existingUser.save();
                    return done(null, existingUser);
                }
            }
            // Create new user (no password needed)
            const newUser = await User.create({
                googleId: profile.id,
                email,
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value
            } as any);
            return done(null, newUser);
        } catch (error) {
            return done(error as Error, undefined);
        }
    }));
    console.log('✅ Google OAuth configured');
} else {
    console.log('⚠️ Google OAuth not configured');
}
passport.serializeUser((user: any, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
export default passport;