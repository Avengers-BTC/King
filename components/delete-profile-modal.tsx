'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';

interface DeleteProfileModalProps {
  userId: string;
  userName: string;
  className?: string;
}

export function DeleteProfileModal({ userId, userName, className }: DeleteProfileModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const confirmationPhrase = 'DELETE MY ACCOUNT';
  const isConfirmationValid = confirmationText === confirmationPhrase;

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      toast.error('Please type the confirmation phrase exactly');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/users/${userId}/delete`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Account deleted successfully');
        // Sign out and redirect to home
        await signOut({ callbackUrl: '/' });
      } else {
        throw new Error(result.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className={`bg-red-600 hover:bg-red-700 ${className}`}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md mx-4 sm:mx-0">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <AlertDialogTitle className="text-red-600">
              Delete Account
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p className="font-medium text-red-600">
              This action cannot be undone!
            </p>
            
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                This will permanently delete:
              </p>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                <li>• Your profile and account information</li>
                <li>• All your moments and uploads</li>
                <li>• Your comments and likes</li>
                <li>• Your followers and following lists</li>
                <li>• DJ profile and events (if applicable)</li>
                <li>• Club profile and data (if applicable)</li>
                <li>• All associated data and history</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation" className="text-sm font-medium">
                Type &quot;<span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">{confirmationPhrase}</span>&quot; to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type the confirmation phrase"
                className="font-mono"
              />
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Alternative:</strong> If you signed up with the wrong account type, 
              <a href="/help/account" className="text-electric-pink hover:underline ml-1">
                check our account help page
              </a> for better solutions.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
          <AlertDialogCancel 
            onClick={() => {
              setConfirmationText('');
              setIsOpen(false);
            }}
            className="w-full sm:w-auto"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Forever
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 