
import { CheckCircle, Hourglass } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'The roadmap for the development of the application.',
};

const RoadmapPage = () => {
  const features = {
    complete: [
      { title: 'User Authentication', status: 'complete', description: 'Secure sign-up and login with email and password.' },
      { title: 'Admin Dashboard', status: 'complete', description: 'Comprehensive user management and feedback review for administrators.' },
      { title: 'Profile Customization', status: 'complete', description: 'Users can upload their own profile pictures.' },
      { title: 'AI Character Hub', status: 'complete', description: 'Create, manage, and interact with unique AI personas.' },
      { title: 'Customizable AI Personas', status: 'complete', description: 'Allow users to edit the AI-generated backstories and personalities of their characters.' },
      { title: 'Visual Media Generation', status: 'complete', description: 'Generate images and videos from text prompts.' },
      { title: 'AI Control Settings', status: 'complete', description: 'Granular control over AI models and safety filter configurations.' },
      { title: 'Persistent Chat History', status: 'complete', description: 'Conversations are saved locally and persist between sessions.' },
      { title: 'Real-time Collaboration', status: 'complete', description: 'Real-time chat sessions with live updates for messages and participants.' },
      { title: 'Expanded AI Toolset', status: 'complete', description: 'Integrated more advanced Genkit tools for functions like web searches.' },
      { title: 'Voice-to-Voice Chat', status: 'complete', description: 'Allow for fully voice-based conversations with AI characters, including AI-generated voice responses.' },
      { title: 'AI Co-Pilot', status: 'complete', description: 'Collaborative tool for AI-powered project feedback.' },
      { title: 'AI-Powered Code Modification', status: 'complete', description: 'Allow the AI to analyze the codebase and generate a plan for code modifications for user review.' },
      { title: 'Gamification & Co-op Features', status: 'complete', description: 'Introduce cooperative goals, like the AI Co-Pilot, to enhance user engagement.' },
      { title: 'Persistent Memory Management', status: 'complete', description: 'Admin-only interface to configure and test the AI's external memory connection.' },
    ],
    upcoming: [
      { title: 'Firebase Analytics', status: 'pending', description: 'Add Firebase Analytics to gather usage data and inform future development.' },
      { title: 'Smart Home Integration', status: 'pending', description: 'Connect with Google Home and Amazon Alexa for a multi-platform AI experience.' },
      { title: 'Cross-Platform Integration', status: 'pending', description: 'Extend the AI's reach to mobile and desktop applications.' },
      { title: 'Android Application Export/Creation', status: 'pending', description: 'Provide the ability to compile and export the application as a native Android package.' },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Roadmap</h1>
      <p className="mb-8">
        This roadmap outlines the development timeline for the application. It is divided into completed features and upcoming features.
      </p>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed</h2>
          <div className="space-y-4">
            {features.complete.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" />
                  <h3 className="font-bold">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
          <div className="space-y-4">
            {features.upcoming.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center">
                  <Hourglass className="text-yellow-500 mr-2" />
                  <h3 className="font-bold">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
