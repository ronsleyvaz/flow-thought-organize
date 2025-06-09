
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, LogIn } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">TranscriptFlow</CardTitle>
              </div>
              <p className="text-gray-600">
                Transform your audio transcripts into actionable tasks, events, and insights.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <SignInButton fallbackRedirectUrl="/">
                  <Button className="w-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In to Continue
                  </Button>
                </SignInButton>
              </div>
              <p className="text-xs text-center text-gray-500">
                Sign in to access your personal TranscriptFlow workspace
              </p>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
      <SignedIn>
        {children}
      </SignedIn>
    </>
  );
};

export default AuthWrapper;
