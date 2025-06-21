# 🧪 NightVibe Testing Plan

## 📋 Test Accounts & Data

The database is now populated with realistic test data for Kenya-based nightlife:

### 👤 User Accounts
- **👑 Admin**: `admin@nightvibe.com` / `admin123`
- **🎧 DJ Amara**: `dj.amara@example.com` / `password123` (Amapiano - Nairobi)
- **🎧 DJ Kevo**: `dj.kevo@example.com` / `password123` (Afrobeats - Mombasa)  
- **🎧 DJ Leila**: `dj.leila@example.com` / `password123` (House - Kisumu)
- **🏢 Sky Lounge**: `info@skylounge.co.ke` / `password123` (Westlands, Nairobi)
- **🏢 Ocean View**: `bookings@oceanview.co.ke` / `password123` (Nyali, Mombasa)
- **🏢 Rhythms**: `events@rhythms.co.ke` / `password123` (Kisumu City)
- **👤 John Doe**: `john.doe@example.com` / `password123` (Regular User)
- **👤 Jane Smith**: `jane.smith@example.com` / `password123` (Regular User)

## 🎯 Phase 1: Core Authentication Testing

### ✅ Registration Flow
1. Visit `/signup`
2. **Test Invalid Data**:
   - Weak password → Should show validation error
   - Invalid email format → Should show error
   - Missing required fields → Should show errors
3. **Test Valid Registration**:
   - Use format: `test.user@example.com` / `Password123!`
   - Should auto-login and redirect to `/dashboard`
   - Should show welcome toast message

### ✅ Login Flow  
1. Visit `/login`
2. **Test Invalid Credentials**:
   - Wrong email/password → Should show error
3. **Test Valid Login**:
   - Use any test account above
   - Should redirect to `/dashboard`
   - Should show user info in navbar dropdown

### ✅ Protected Routes
**While Logged Out**, try accessing:
- `/dashboard` → Should redirect to `/login`
- `/profile` → Should redirect to `/login`
- `/moments/upload` → Should redirect to `/login`

### ✅ Session Management
1. Login successfully
2. Refresh page → Should stay logged in
3. Test logout → Should redirect to home
4. Try accessing protected route → Should redirect to login

## 🎯 Phase 2: UI & Theme Testing

### ✅ Theme Switching
1. **Test Dark/Light Mode Toggle**:
   - Click theme button in navbar
   - Verify all components change colors properly
   - Check text readability in both modes
   - Test across all pages

### ✅ Responsive Design
1. **Desktop** (1920x1080)
2. **Tablet** (768x1024) 
3. **Mobile** (375x667)
4. **Test Navigation Menu**:
   - Desktop: Horizontal nav
   - Mobile: Hamburger menu

## 🎯 Phase 3: Data Display Testing

### ✅ Home Page (`/`)
**Expected Behavior**:
- Stats should show: "3 Active DJs", "3 Nightlife Venues", "0 Moments Shared"
- Top DJs section should display: DJ Amara, DJ Kevo, DJ Leila
- Featured Clubs section should display: Sky Lounge, Ocean View, Rhythms
- All cards should be clickable

### ✅ DJs Page (`/djs`)
**Expected Behavior**:
- Should display 3 DJ cards with ratings and fan counts
- Search functionality should work
- Genre filter should work
- Click on DJ card → Should navigate to DJ profile page

### ✅ Clubs Page (`/clubs`)  
**Expected Behavior**:
- Should display 3 club cards with ratings and locations
- Search by name/location should work
- Filter functionality should work
- Click on club card → Should navigate to club profile page

### ✅ Leaderboard Page (`/leaderboard`)
**Expected Behavior**:
- **DJs Tab**: Shows top DJs by rating (DJ Leila first - 4.9★)
- **Clubs Tab**: Shows top clubs by rating (Sky Lounge first - 4.7★)
- Stats should show updated numbers (not zeros)

### ✅ Individual Profile Pages
1. **DJ Profile** (`/djs/[id]`):
   - Visit any DJ profile (e.g., click DJ Amara)
   - Should show DJ info, bio, stats, social links
   - Should display upcoming events
   - Should show fan comments section

2. **Club Profile** (`/clubs/[id]`):
   - Visit any club profile (e.g., click Sky Lounge)
   - Should show club info, amenities, hours
   - Should display current event info
   - Should show live chat section

## 🎯 Phase 4: User Dashboard Testing

### ✅ Dashboard (`/dashboard`) - Requires Login
**Test with different user types**:

1. **Regular User** (John Doe):
   - Should show user welcome message
   - Stats should show user's activity (mostly zeros initially)
   - Quick actions should be available

2. **DJ User** (DJ Amara):
   - Should show DJ-specific dashboard
   - Should display DJ stats and upcoming events

3. **Club Owner** (Sky Lounge):
   - Should show club management options
   - Should display club metrics

### ✅ Profile Page (`/profile`) - Requires Login
- Should display user information
- Should show user's moments (empty initially)
- Should allow profile editing (UI placeholder)

## 🎯 Phase 5: API Endpoints Testing

Open browser dev tools → Network tab, then test:

### ✅ GET Endpoints
- `/api/djs` → Should return 3 DJs with user info
- `/api/djs?limit=2` → Should return only 2 DJs
- `/api/clubs` → Should return 3 clubs with events
- `/api/leaderboard` → Should return top DJs and clubs
- `/api/moments` → Should return empty array (no moments yet)

### ✅ Individual Resource Endpoints
- `/api/djs/[id]` → Should return specific DJ with events
- `/api/clubs/[id]` → Should return specific club with details
- `/api/users/[id]` → Should return user profile

## 🎯 Phase 6: Error Handling Testing

### ✅ 404 Pages
- Visit `/djs/nonexistent-id` → Should show "DJ Not Found"
- Visit `/clubs/nonexistent-id` → Should show "Club Not Found"  
- Visit `/random-page` → Should show 404 page

### ✅ API Error Handling
- Check API responses for proper error messages
- Test network failures (disconnect internet)

## 🎯 Phase 7: Performance Testing

### ✅ Page Load Times
- Home page should load < 3 seconds
- Navigation between pages should be smooth
- Images should load progressively

### ✅ Database Queries
- Check for N+1 query problems
- Verify proper use of includes in Prisma queries

## 🎯 Phase 8: User Experience Testing

### ✅ Complete User Journey
1. **New User**:
   - Visit home page
   - Browse DJs and clubs
   - Sign up for account
   - Explore dashboard
   - Check profile page

2. **Returning User**:
   - Login quickly
   - Browse updated content
   - Navigate efficiently

### ✅ Interactive Elements
- All buttons should have hover effects
- Links should work correctly
- Forms should provide feedback
- Loading states should be visible

## 🚀 Recommended Next Steps

After testing is complete, consider adding:

### 📱 Enhanced Features
1. **Moment Upload System**: Allow users to share photos/videos
2. **DJ Booking System**: Allow clubs to book DJs
3. **Event RSVP**: Users can RSVP to events
4. **User Following**: Follow favorite DJs/clubs
5. **Push Notifications**: Event reminders
6. **Chat System**: Real-time club chat
7. **Rating System**: User ratings and reviews
8. **Search & Filters**: Advanced search capabilities

### 🔐 Security Enhancements
1. **Rate Limiting**: API rate limiting
2. **Input Validation**: Server-side validation
3. **Image Upload**: Secure file upload system
4. **Content Moderation**: User-generated content filtering

### 🎨 UI/UX Improvements
1. **Loading Skeletons**: Better loading states
2. **Empty States**: Better empty state designs
3. **Error Boundaries**: React error boundaries
4. **Accessibility**: ARIA labels and keyboard navigation
5. **PWA Features**: Offline functionality

## 🏁 Success Criteria

The app is ready for production when:
- ✅ All authentication flows work perfectly
- ✅ Theme switching works across all components
- ✅ All pages load correctly with sample data
- ✅ API endpoints return proper data
- ✅ Mobile responsiveness is perfect
- ✅ Error handling is comprehensive
- ✅ User experience is smooth and intuitive

---

**🎉 You now have a fully functional nightlife platform for Kenya with realistic test data!** 