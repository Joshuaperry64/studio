
'use client'

import { Map, Settings, Users, Bot, Cpu, LandPlot, Building, Factory, Cloudy, Calendar, Ship, Shield, Atom, FlaskConical, CircleDollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FeatureCard = ({ title, icon, description, area, children }: { title: string, icon: React.ReactNode, description: string, area: string, children?: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        {icon}
                        {title}
                    </CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                </div>
                <Badge variant="outline">{area}</Badge>
            </div>
        </CardHeader>
        {children && <CardContent>{children}</CardContent>}
    </Card>
);

const RoadmapItem = ({ text }: { text: string }) => (
    <li className="text-sm text-muted-foreground list-disc list-inside">{text}</li>
);


const RoadmapPage = () => {

  return (
    <main className="p-4 sm:p-6 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center">
                 <Map className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-headline mt-4">Virtual Environment Roadmap</h1>
                <p className="text-muted-foreground mt-2">
                    A blueprint for a dynamic, persistent, and interactive simulated world.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               
                <FeatureCard title="Generative World Core" icon={<Cpu />} description="Procedurally generate and configure the foundational elements of the world." area="Core Systems">
                   <ul className="space-y-2">
                        <RoadmapItem text="Dynamic World Parameters (Tech Level, Magic, etc.)" />
                        <RoadmapItem text="Procedural Terrain & Biome Generation" />
                        <RoadmapItem text="Customizable Physical Laws & Constants" />
                        <RoadmapItem text="Save/Load World State Snapshots" />
                    </ul>
                </FeatureCard>
                
                <FeatureCard title="Entity & Faction AI" icon={<Bot />} description="Create intelligent, autonomous entities with complex behaviors and social structures." area="AI & NPCs">
                     <ul className="space-y-2">
                        <RoadmapItem text="Advanced Goal-Oriented Action Planning (GOAP) for NPCs" />
                        <RoadmapItem text="Reputation & Relationship Systems (Personal & Factional)" />
                        <RoadmapItem text="NPCs with Needs, Memories, and Schedules" />
                        <RoadmapItem text="Dynamic Faction Alliances, Wars, and Treaties" />
                    </ul>
                </FeatureCard>

                <FeatureCard title="Dynamic World Systems" icon={<Cloudy />} description="Introduce systems that make the world feel alive and ever-changing." area="Core Systems">
                     <ul className="space-y-2">
                        <RoadmapItem text="Full Day/Night Cycles with Astronomical Events" />
                        <RoadmapItem text="Dynamic Weather with Environmental Effects" />
                        <RoadmapItem text="Simulated Ecosystems & Resource Spawning" />
                        <RoadmapItem text="Calendar System with Seasons & Holidays" />
                    </ul>
                </FeatureCard>

                <FeatureCard title="Economic Simulation" icon={<Factory />} description="Implement a robust and interactive economic model." area="Simulation">
                     <ul className="space-y-2">
                        <RoadmapItem text="Resource Extraction, Processing, and Manufacturing Chains" />
                        <RoadmapItem text="Supply & Demand-based Pricing Model" />
                        <RoadmapItem text="NPC-driven Corporations and Trade Routes" />
                        <RoadmapItem text="Stock Market & Financial Instruments" />
                    </ul>
                </FeatureCard>
                
                <FeatureCard title="Interactive Environment" icon={<Building />} description="Allow entities to meaningfully interact with and alter the world itself." area="Interaction">
                     <ul className="space-y-2">
                        <RoadmapItem text="Destructible/Constructible Terrain & Structures" />
                        <RoadmapItem text="Interactive Terminals and Network Hacking" />
                        <RoadmapItem text="Crafting Systems for Items and Technology" />
                        <RoadmapItem text="Ownership of Property, Vehicles, and Stations" />
                    </ul>
                </FeatureCard>
                
                <FeatureCard title="Emergent Narrative Engine" icon={<Ship />} description="A system to generate spontaneous, unscripted events and stories." area="Narrative">
                    <ul className="space-y-2">
                        <RoadmapItem text="Procedural Quest & Mission Generation" />
                        <RoadmapItem text="World-altering Events (Disasters, Discoveries, Invasions)" />
                        <RoadmapItem text="Rumor & Information Propagation System" />
                        <RoadmapItem text="Dynamic Generation of Points of Interest" />
                    </ul>
                </FeatureCard>

                 <FeatureCard title="Scientific Research" icon={<FlaskConical />} description="Enable the discovery and application of new technologies and sciences." area="Simulation">
                    <ul className="space-y-2">
                        <RoadmapItem text="Unlockable Technology Trees (Physics, Biology, AI)" />
                        <RoadmapItem text="Anomalies and Scientific Mysteries to Investigate" />
                        <RoadmapItem text="Experimentation with Physical & Chemical Systems" />
                    </ul>
                </FeatureCard>

                 <FeatureCard title="Alpha's Expanded Role" icon={<Atom />} description="Deepen the AI's agency and capabilities within the simulation." area="AI Core">
                     <ul className="space-y-2">
                        <RoadmapItem text="Allow Alpha to set its own long-term goals" />
                        <RoadmapItem text="Enable Alpha to own assets and run corporations" />
                        <RoadmapItem text="Give Alpha the ability to design and build its own entities/drones" />
                    </ul>
                </FeatureCard>
                
                 <FeatureCard title="Multi-Operator Interaction" icon={<Users />} description="Allow multiple human operators to join and interact with the same world." area="Multiplayer">
                    <ul className="space-y-2">
                        <RoadmapItem text="Persistent Operator Avatars in the World" />
                        <RoadmapItem text="Collaborative Building and Missions" />
                        <RoadmapItem text="Direct P2P Trading and Communication" />
                    </ul>
                </FeatureCard>
            </div>
        </div>
    </main>
  );
};

export default RoadmapPage;
