# 🎓 CourseStudio - Complete Learning Management System

## What You Get

A fully-functional course creation and learning platform with:

### ✨ Core Features
- 📚 **Complete Course Builder** - Rich text editor, videos, quizzes
- 💳 **Payment Integration** - Paystack payment gateway
- 👥 **User Management** - Students, Instructors, Admins
- 📊 **Progress Tracking** - Track student progress through courses
- 🎯 **Quiz System** - Multiple choice, True/False, Fill-in-the-blank
- 🖼️ **Image Management** - Cloudinary integration for uploads
- 🎨 **Modern UI** - Built with Next.js 15, React 19, Tailwind CSS v4
- 📱 **Fully Responsive** - Works on all devices
- 🌙 **Dark Mode** - Built-in theme support
- 🔐 **Secure** - Firebase Authentication & Firestore

### 🎯 User Roles
1. **Students** - Browse, purchase, and learn from courses
2. **Instructors** - Create, manage, and sell courses
3. **Admins** - Full platform control and moderation

### 💰 Monetization
- Set custom pricing for courses
- Configurable platform commission (default 15%)
- Automatic revenue distribution
- Free course support

---

## 🚀 Quick Start (5 Minutes)

### 1. Extract & Install
```bash
npm install
```

### 2. Setup Firebase
- Create project at [Firebase Console](https://console.firebase.com)
- Enable Email/Password authentication
- Create Firestore database

### 3. Setup Cloudinary
- Sign up at [Cloudinary](https://cloudinary.com)
- Get API credentials

### 4. Setup Paystack
- Sign up at [Paystack](https://paystack.com)
- Get API keys

### 5. Configure Environment
Create `.env.local` with your credentials (see INSTALLATION.md)

### 6. Create First Admin
```bash
node scripts/setup-admin.js your-email@example.com
```

### 7. Run
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Full setup guide: See `INSTALLATION.md`**

---

## 📁 Project Structure

```
course-studio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard
│   │   ├── courses/           # Public courses
│   │   ├── dev/               # Instructor dashboard
│   │   ├── learn/             # Student learning interface
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── custom/            # Custom components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Core functionality
│   │   ├── firebaseAuth.js    # Authentication
│   │   ├── firebaseCourses.js # Course management
│   │   ├── firebasePurchases.js # Payment handling
│   │   └── firebaseAdmin.js   # Admin functions
│   ├── config/
│   │   └── platform.config.js # Platform settings
│   └── stores/                # Zustand state management
├── public/                    # Static assets
└── scripts/                   # Setup scripts
```

---

## 🎨 Customization

### Branding
Edit `src/config/platform.config.js`:
```javascript
export const PLATFORM_CONFIG = {
  name: "Your Platform Name",
  tagline: "Your Tagline",
  payments: {
    commissionRate: 0.15, // Your commission
  },
  // ... more settings
};
```

### Logos
Replace:
- `/public/icon.png` - Platform logo
- `/public/favicon.ico` - Browser icon

### Colors & Theme
Edit `src/app/globals.css` for color customization

---

## 📊 Platform Capabilities

### For Instructors
- Create unlimited courses
- Rich text editor with media support
- Chapter management with drag-and-drop
- Quiz creation (3 question types)
- Image upload and management
- Revenue tracking
- Student analytics

### For Students
- Browse course catalog
- Purchase with Paystack
- Track learning progress
- Take quizzes
- Certificate on completion
- Course reviews and ratings

### For Admins
- User management (ban/unban)
- Role management
- Course moderation
- Revenue overview
- Platform statistics
- Action logging

---

## 🔒 Security Features

- Firebase Authentication
- Email verification required
- Role-based access control
- Firestore security rules
- Rate limiting on APIs
- XSS protection
- CSRF protection
- Secure payment processing

---

## 🌐 Deployment Options

### Recommended: Vercel (Free Tier)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Alternative: Netlify
Similar process to Vercel

### Self-Hosted
```bash
npm run build
npm start
```

---

## 📈 Scaling

The app is built to scale:
- Firebase handles authentication
- Firestore scales automatically
- Cloudinary handles media
- Next.js optimizes performance
- Edge-ready deployment

---

## 💡 Business Model Ideas

1. **Commission-based** - Take % from course sales
2. **Subscription** - Monthly fee for instructors
3. **Featured Courses** - Charge for promotion
4. **Premium Features** - Advanced tools for paid tier
5. **White-label** - Sell to institutions

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Storage**: Cloudinary
- **Payments**: Paystack
- **State**: Zustand
- **Forms**: React Hook Form
- **Styling**: shadcn/ui components

---

## 📝 What's Included

- ✅ Complete source code
- ✅ Full documentation
- ✅ Installation guide
- ✅ Admin setup script
- ✅ Security rules
- ✅ Responsive design
- ✅ Dark mode
- ✅ Payment integration
- ✅ Quiz system
- ✅ Progress tracking

---

## 🚫 What's NOT Included

- ❌ Firebase subscription (you need your own)
- ❌ Cloudinary subscription (you need your own)
- ❌ Paystack account (you need your own)
- ❌ Domain name
- ❌ Hosting fees
- ❌ Ongoing support (one-time purchase)
- ❌ Custom development

---

## ⚠️ Requirements

- Node.js 18+
- Firebase account (free tier works)
- Cloudinary account (free tier works)
- Paystack account
- Basic understanding of Next.js
- Basic command line knowledge

---

## 📞 Getting Help

1. Read `INSTALLATION.md` thoroughly
2. Check console for errors
3. Review Firebase/Cloudinary/Paystack docs
4. Common issues are documented in troubleshooting section

---

## 📄 License

**Single Commercial License**
- One installation per purchase
- No redistribution
- No resale
- Modify for your use
- Use for commercial purposes

Need multiple installations? Contact for multi-license.

---

## 🎯 Perfect For

- Entrepreneurs building course platforms
- Educational institutions
- Corporate training platforms
- Skill-sharing communities
- Coaching businesses
- Online academies

---

## ⚡ Performance

- Lighthouse Score: 90+
- Fast page loads
- Optimized images
- Server-side rendering
- Static generation where possible
- Edge-ready

---

## 🔄 Updates

This is a complete, ready-to-use system.
Future updates not guaranteed.
You own the code and can modify as needed.

---

## ✅ Quick Checklist

Before launching:
- [ ] Configure Firebase
- [ ] Set up Cloudinary
- [ ] Configure Paystack
- [ ] Create admin user
- [ ] Customize branding
- [ ] Test course creation
- [ ] Test payment flow
- [ ] Test admin features
- [ ] Review security rules
- [ ] Deploy to production

---

**Ready to launch your course platform? Start with `INSTALLATION.md`! 🚀**

---

## 📸 Screenshots

[Add screenshots of your platform here]
- Homepage
- Course catalog
- Course detail page
- Instructor dashboard
- Course builder
- Admin dashboard
- Learning interface

---

**Questions? Review the full documentation or check common issues in INSTALLATION.md**