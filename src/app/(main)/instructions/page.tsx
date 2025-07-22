
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ImageIcon, MessageSquare, Smile, Users, Home, Globe } from 'lucide-react';

export default function InstructionsPage() {
  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-3xl font-headline mt-4">Application Instructions</h1>
            <p className="text-muted-foreground mt-2">
                Your guide to harnessing the power of AlphaLink.
            </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                AI Chat
            </CardTitle>
            <CardDescription>
              The central hub for interacting with the AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>The AI Chat page is your primary interface for conversing with the AI. You can type messages, attach media, and even use your voice.</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Text Input:</strong> Simply type your message in the text area and press Enter or click the Send button.</li>
                <li><strong>Media Attachments:</strong> Click the paperclip icon to attach an image or video file. The AI will analyze the media along with your text prompt.</li>
                <li><strong>Voice Input:</strong> Click the microphone icon to start recording audio. Click it again to stop. Your speech will be transcribed into the text input area.</li>
                <li><strong>Active Characters:</strong> Your conversations will be with the default AI unless you select an active character from the Character Hub. The AI's personality and avatar will change to match your selection.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Smile className="h-6 w-6" />
                Character Hub
            </CardTitle>
            <CardDescription>
              Create, manage, and select AI personas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>The Character Hub allows you to create and manage a roster of unique AI characters. This feature transforms your chat experience from a simple Q&A to a dynamic conversation.</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Create a Character:</strong> Click the "Create Character" button. Provide a name and a short concept (e.g., "A wise old wizard who speaks in riddles").</li>
                <li><strong>AI Generation:</strong> The AI will use your concept to generate a full backstory, a detailed personality, and a unique avatar image for your character.</li>
                <li><strong>Manage Characters:</strong> Your created characters will appear as cards. You can review their personalities or delete them using the trash icon.</li>
                <li><strong>Set Active Character:</strong> Click the "Set as Active" button on any character card. This will make them your conversational partner in the AI Chat page, influencing the tone and style of the responses.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-6 w-6" />
                Visual Media Generation
            </CardTitle>
            <CardDescription>
              Generate images and videos from text prompts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>This tool leverages powerful generative AI models to turn your textual descriptions into visual media.</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Select Media Type:</strong> Choose whether you want to generate an image or a video.</li>
                <li><strong>Write a Prompt:</strong> Be descriptive! The more detailed your prompt (e.g., "An astronaut riding a horse on Mars, photorealistic"), the better the result.</li>
                <li><strong>Video Options:</strong> When generating a video, you can also specify the aspect ratio (landscape or portrait) and the duration (5-8 seconds).</li>
                <li><strong>View Result:</strong> The generated media will appear on the right side of the screen. Generation, especially for video, may take up to a minute.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Co-Pilot
            </CardTitle>
            <CardDescription>
              Get AI-powered feedback for your collaborative projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>The Co-Pilot is designed to act as an impartial member of your team, providing structured analysis on ideas and suggestions.</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Project Description:</strong> Provide a detailed description of your project's goals and current status.</li>
                <li><strong>AI Persona:</strong> Define the personality of the AI assistant (e.g., "A critical project manager," "An enthusiastic creative"). This will influence the tone of the feedback.</li>
                <li><strong>Add Suggestions:</strong> Input suggestions or feedback points from your team members.</li>
                <li><strong>Analyze:</strong> The AI will review all the information, decide whether to incorporate each suggestion, provide a rationale for its decision, and generate a revised project description.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Home className="h-6 w-6" />
                Smart Home (Upcoming)
            </CardTitle>
            <CardDescription>
              Connect with Google Home and Amazon Alexa for a multi-platform AI experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
             <p>This upcoming feature will allow AlphaLink to integrate with your smart home devices. You'll be able to interact with the AI from anywhere in your home, connecting your digital and physical worlds.</p>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
