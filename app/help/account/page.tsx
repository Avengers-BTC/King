'use client';

import { AlertTriangle, HelpCircle, Mail, User, Users } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AccountHelpPage() {
  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-app-text mb-4">
            Account <span className="text-electric-pink">Management</span>
          </h1>
          <p className="text-app-text/70 max-w-2xl mx-auto">
            Get help with your account settings, role changes, and deletion options.
          </p>
        </div>

        <div className="space-y-8">
          {/* Account Types */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-app-text flex items-center">
                <Users className="h-6 w-6 mr-3 text-electric-pink" />
                Account Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-app-surface/50 rounded-lg">
                  <h3 className="font-semibold text-electric-pink mb-2">Fan Account</h3>
                  <p className="text-sm text-app-text/70">
                    Follow DJs, discover clubs, share moments, and engage with the nightlife community.
                  </p>
                </div>
                <div className="p-4 bg-app-surface/50 rounded-lg">
                  <h3 className="font-semibold text-neon-cyan mb-2">DJ Account</h3>
                  <p className="text-sm text-app-text/70">
                    Create your professional profile, manage events, connect with fans, and go live.
                  </p>
                </div>
                <div className="p-4 bg-app-surface/50 rounded-lg">
                  <h3 className="font-semibold text-neon-purple mb-2">Club Account</h3>
                  <p className="text-sm text-app-text/70">
                    List your venue, manage DJ bookings, promote events, and attract customers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wrong Account Type */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-app-text flex items-center">
                <HelpCircle className="h-6 w-6 mr-3 text-neon-cyan" />
                Signed Up with Wrong Account Type?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Don&apos;t delete your account yet!</strong> We have better solutions for you.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-app-text">Options Available:</h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-electric-pink rounded-full mt-2"></div>
                    <div>
                      <p className="text-app-text"><strong>Account Role Upgrade:</strong></p>
                      <p className="text-sm text-app-text/70">
                        Contact support to upgrade your fan account to DJ or Club owner status.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full mt-2"></div>
                    <div>
                      <p className="text-app-text"><strong>Multiple Roles:</strong></p>
                      <p className="text-sm text-app-text/70">
                        Your account can have multiple roles. A DJ can also follow other DJs as a fan.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-neon-purple rounded-full mt-2"></div>
                    <div>
                      <p className="text-app-text"><strong>Data Preservation:</strong></p>
                      <p className="text-sm text-app-text/70">
                        Keep all your existing moments, followers, and activity when changing roles.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="bg-electric-pink hover:bg-electric-pink/80">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="glass-card border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3" />
                Account Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-500/20 bg-red-950/20">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  Account deletion is permanent and cannot be undone. Consider alternatives first.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold text-red-400">What Gets Deleted:</h4>
                <ul className="space-y-1 text-sm text-app-text/70">
                  <li>• Your profile and personal information</li>
                  <li>• All moments, photos, and videos you&apos;ve shared</li>
                  <li>• Your comments, likes, and reactions</li>
                  <li>• Follower and following relationships</li>
                  <li>• DJ profile, events, and fan connections (if applicable)</li>
                  <li>• Club profile, venue information, and bookings (if applicable)</li>
                  <li>• All chat messages and conversation history</li>
                  <li>• Account credentials and login information</li>
                </ul>

                <div className="pt-4">
                  <h4 className="font-semibold text-app-text mb-2">How to Delete Your Account:</h4>
                  <ol className="space-y-1 text-sm text-app-text/70">
                    <li>1. Go to your Profile page or Dashboard</li>
                    <li>2. Scroll down to the &quot;Danger Zone&quot; section</li>
                    <li>3. Click &quot;Delete Account&quot;</li>
                    <li>4. Read the warnings carefully</li>
                    <li>5. Type the confirmation phrase exactly</li>
                    <li>6. Confirm deletion</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-app-text flex items-center">
                <Mail className="h-6 w-6 mr-3 text-electric-pink" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-app-text/70 mb-4">
                Our support team is here to help with account issues, role changes, and any questions you might have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="border-electric-pink/30 text-electric-pink hover:bg-electric-pink/10">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 