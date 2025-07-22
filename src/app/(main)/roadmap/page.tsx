
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Map } from 'lucide-react';

interface RoadmapItemProps {
  title: string;
  status: 'complete' | 'pending';
  children: React.ReactNode;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({ title, status, children }) => (
  <div className="relative pl-8">
    <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
      {status === 'complete' ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Clock className="h-4 w-4 text-yellow-500" />
      )}
    </div>
    <div className="flex items-center gap-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Badge variant={status === 'complete' ? 'secondary' : 'outline'} className={status === 'complete' ? 'bg-green-700/50 text-green-400' : 'text-yellow-400 border-yellow-400/50'}>
        {status === 'complete' ? 'Complete' : 'Pending'}
      </Badge>
    </div>
    <p className="mt-1 text-muted-foreground">{children}</p>
  </div>
);

const roadmapData = {
  infrastructure: [
    { title: 'Next.js 15 & App Router', status: 'complete', description: 'Foundation built on the latest Next.js features for optimal performance.' },
    { title: 'TypeScript Integration', status: 'complete', description: 'Full type-safety across the entire application.' },
    { title: 'UI with ShadCN & Tailwind', status: 'complete', description: 'Modern, responsive, and accessible user interface.' },
    { title: 'Genkit for AI', status: 'complete', description: 'Integrated Google\'s Genkit for all generative AI functionalities.' },
    { title: 'Cloud-Based Data Storage', status: 'complete', description: 'User accounts, feedback, and collaborative sessions are stored persistently in Firestore.' },
  ],
  userFeatures: [
    { title: 'Authentication System', status: 'complete', description: 'Secure PIN-based login with session management and user roles.' },
    { title: 'Admin Dashboard', status: 'complete', description: 'Comprehensive user management and feedback review for administrators.' },
    { title: 'Profile Customization', status: 'complete', description: 'Users can upload their own profile pictures.' },
    { title: 'AI Character Hub', status: 'complete', description: 'Create, manage, and interact with unique AI personas.' },
    { title: 'Visual Media Generation', status: 'complete', description: 'Generate images and videos from text prompts.' },
    { title: 'AI Co-Pilot', status: 'complete', description: 'Collaborative tool for AI-powered project feedback.' },
    { title: 'Persistent Chat History', status: 'complete', description: 'Conversations are saved locally and persist between sessions.' },
    { title: 'Real-time Collaboration', status: 'complete', description: 'Real-time chat sessions with live updates for messages and participants.' },
    { title: 'Expanded AI Toolset', status: 'complete', description: 'Integrate more advanced Genkit tools for functions like web searches, data analysis, and more.' },
  ],
  upcoming: [
    { title: 'AI-Powered Code Modification', status: 'pending', description: 'Allow the AI to directly suggest and apply code changes to the application codebase.' },
    { title: 'Smart Home Integration', status: 'pending', description: 'Connect with Google Home and Amazon Alexa for a multi-platform AI experience.' },
    { title: 'Voice-to-Voice Chat', status: 'pending', description: 'Allow for fully voice-based conversations with AI characters, including AI-generated voice responses.' },
    { title: 'Gamification & Co-op Features', status: 'pending', description: 'Introduce cooperative goals, leaderboards, or shared achievements to enhance user engagement.' },
  ],
};

export default function RoadmapPage() {
  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
            <Map className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-3xl font-headline mt-4">Project Roadmap</h1>
            <p className="text-muted-foreground mt-2">
                Our journey of building AlphaLink: what's done and what's next.
            </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Core Infrastructure</CardTitle>
            <CardDescription>The foundational technologies that power the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative space-y-6 before:absolute before:inset-y-0 before:w-px before:bg-border before:left-3">
              {roadmapData.infrastructure.map(item => (
                <RoadmapItem key={item.title} title={item.title} status={item.status as any}>
                  {item.description}
                </RoadmapItem>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Features & AI Capabilities</CardTitle>
            <CardDescription>The features that have been implemented and are ready for use.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="relative space-y-6 before:absolute before:inset-y-0 before:w-px before:bg-border before:left-3">
              {roadmapData.userFeatures.map(item => (
                <RoadmapItem key={item.title} title={item.title} status={item.status as any}>
                  {item.description}
                </RoadmapItem>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Features</CardTitle>
            <CardDescription>What we're planning to build next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="relative space-y-6 before:absolute before:inset-y-0 before:w-px before:bg-border before:left-3">
              {roadmapData.upcoming.map(item => (
                <RoadmapItem key={item.title} title={item.title} status={item.status as any}>
                  {item.description}
                </RoadmapItem>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
