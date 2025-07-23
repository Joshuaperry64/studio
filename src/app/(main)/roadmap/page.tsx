
'use client'

import { CheckCircle, Hourglass, AlertTriangle, PlayCircle } from 'lucide-react';
import { Metadata } from 'next';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// export const metadata: Metadata = { // Metadata can't be used in a client component
//   title: 'Dev Roadmap',
//   description: 'The development roadmap and to-do list for the Master Operator.',
// };

const RoadmapPage = () => {
    const { user } = useUserStore();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/chat');
        }
    }, [user, router]);

  const features = {
    needsTesting: [
      { title: 'User-to-User Chat ("Operator Comm")', status: 'pending', description: 'Test creating sessions, joining, sending messages, and using the @ai command in the Chat Lobby.', area: 'Collaboration' },
      { title: 'AI Co-Pilot', status: 'pending', description: 'Test the full loop: create a session, add suggestions, and run the AI analysis. Verify the revised description makes sense.', area: 'Collaboration' },
      { title: 'Local Stable Diffusion', status: 'pending', description: 'Requires a local SD instance running. Test generating an image using this source from the Visual Media page.', area: 'Fabrication' },
      { title: 'Project Management', status: 'pending', description: 'Test creating public/private projects. Edit the roadmap, canvas, and documentation and ensure changes are saved.', area: 'Collaboration' },
      { title: 'Virtual Environment Interaction', status: 'pending', description: 'From the Alpha Comms page, give the AI commands that imply movement or action (e.g., "scan the room") and observe the Event Log in the Virtual Environment page.', area: 'Mainframe' },
    ],
    halfSetup: [
       { title: 'Smart Home Integration', status: 'half-setup', description: 'System status widget exists on the Admin dashboard, but no connection logic is implemented yet. Needs flows and APIs to connect with Google/Alexa.', area: 'Integrations' },
       { title: 'Persistent Memory Connection', status: 'half-setup', description: 'Settings UI is complete for configuration, but the backend test API is a placeholder and there is no live connection logic to mount the Samba share.', area: 'System' },
       { title: 'Code Synthesis "Apply" Button', status: 'half-setup', description: 'The AI can generate a plan and changeset, but the button to automatically apply these file changes to the codebase is not yet implemented.', area: 'Fabrication' },
    ],
    complete: [
      { title: 'User Authentication', status: 'complete', description: 'Secure sign-up, login, and profile management with role-based access.', area: 'System' },
      { title: 'Admin Dashboard', status: 'complete', description: 'Comprehensive user management and feedback review for administrators.', area: 'System' },
      { title: 'AI Character Hub', status: 'complete', description: 'Create, manage, and interact with unique AI personas with full-body avatars and assigned voices.', area: 'Mainframe' },
      { title: 'Visual Media Generation (Gemini)', status: 'complete', description: 'Generate images and videos from text prompts using Gemini.', area: 'Fabrication' },
      { title: 'AI Control Settings', status: 'complete', description: 'Granular control over AI models and safety filter configurations.', area: 'System' },
    ],
  };

  if (!user || user.role !== 'admin') {
    return null; // or a loading/access denied component
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-headline">Development Roadmap & To-Do</h1>
                <p className="text-muted-foreground mt-2">
                    A private tracker for the Master Operator.
                </p>
            </div>
            <div className="space-y-8">
                <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><PlayCircle className="text-blue-400" />Ready for Testing</h2>
                <div className="space-y-4">
                    {features.needsTesting.map((feature, index) => (
                    <div key={index} className="p-4 border border-blue-400/50 rounded-lg bg-blue-900/20">
                        <div className="flex items-center">
                        <h3 className="font-bold">{feature.title}</h3>
                        <span className="ml-auto text-xs font-mono text-blue-400/80">{feature.area}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                    ))}
                </div>
                </div>
                <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="text-yellow-400" />Partially Implemented</h2>
                <div className="space-y-4">
                    {features.halfSetup.map((feature, index) => (
                    <div key={index} className="p-4 border border-yellow-400/50 rounded-lg bg-yellow-900/20">
                        <div className="flex items-center">
                        <h3 className="font-bold">{feature.title}</h3>
                         <span className="ml-auto text-xs font-mono text-yellow-400/80">{feature.area}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                    ))}
                </div>
                </div>
                <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CheckCircle className="text-green-400" />Completed Features</h2>
                <div className="space-y-4">
                    {features.complete.map((feature, index) => (
                    <div key={index} className="p-4 border border-green-400/20 rounded-lg bg-green-900/10">
                        <div className="flex items-center">
                         <h3 className="font-bold text-muted-foreground line-through">{feature.title}</h3>
                         <span className="ml-auto text-xs font-mono text-green-400/50">{feature.area}</span>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </div>
      </div>
    </main>
  );
};

export default RoadmapPage;
