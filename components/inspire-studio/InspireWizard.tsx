'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Phase {
  id: string;
  name: string;
  category: string;
}

// Progress Bar Component
function ProgressBar({
  phases,
  currentIndex,
}: {
  phases: Phase[];
  currentIndex: number;
}): React.JSX.Element {
  const progress = ((currentIndex + 1) / phases.length) * 100;

  return (
    <div className="mb-8">
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute h-full bg-linear-to-r from-blue-600 via-purple-600 to-pink-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-brand-secondary">
          Step {currentIndex + 1} of {phases.length}
        </span>
        <span className="text-brand-secondary">{Math.round(progress)}% Complete</span>
      </div>
    </div>
  );
}

// Welcome Screen
function WelcomeScreen(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="text-8xl mb-6">🧠</div>
      <h2 className="text-4xl font-bold text-brand-primary mb-4">Welcome to INSPIRE</h2>
      <p className="text-xl text-brand-secondary mb-8 max-w-2xl mx-auto">
        A neuroscience-backed framework for designing transformative learning experiences
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
        <div className="p-6 bg-blue-50 rounded-xl">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="font-bold text-blue-800 mb-2">Phase 1: Encoding</h3>
          <p className="text-sm text-brand-secondary">
            Establish learning foundations with ITLA, NPPM, ILMI, and ICES
          </p>
        </div>

        <div className="p-6 bg-purple-50 rounded-xl">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="font-bold text-purple-800 mb-2">Phase 2: Synthesization</h3>
          <p className="text-sm text-brand-secondary">
            Map competencies with ICL, IPMG, ICDT, and ICPF
          </p>
        </div>

        <div className="p-6 bg-pink-50 rounded-xl">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="font-bold text-pink-800 mb-2">Phase 3: Assimilation</h3>
          <p className="text-sm text-brand-secondary">
            Design experiences with IDNS, IADC, ILEM, and IALM
          </p>
        </div>
      </div>

      <div className="bg-linear-to-r from-blue-100 to-purple-100 p-6 rounded-xl max-w-2xl mx-auto">
        <p className="text-brand-secondary font-semibold">
          This wizard will guide you through all 12 tools of the INSPIRE framework to create a
          complete learning experience design.
        </p>
      </div>
    </motion.div>
  );
}

// Phase Introduction Screens
function PhaseIntroScreen({
  phase,
  description,
  tools,
}: {
  phase: string;
  description: string;
  tools: { name: string; description: string }[];
}): React.JSX.Element {
  const colors: Record<string, { bg: string; text: string; gradient: string }> = {
    encoding: { bg: 'bg-blue-50', text: 'text-blue-800', gradient: 'from-blue-600 to-blue-400' },
    synthesization: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      gradient: 'from-purple-600 to-purple-400',
    },
    assimilation: {
      bg: 'bg-pink-50',
      text: 'text-pink-800',
      gradient: 'from-pink-600 to-pink-400',
    },
  };

  const color = colors[phase] || colors.encoding;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <h2 className={`text-4xl font-bold ${color.text} mb-4 capitalize`}>{phase} Phase</h2>
      <p className="text-xl text-brand-secondary mb-8 max-w-2xl mx-auto">{description}</p>

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {tools.map((tool, idx) => (
          <div key={idx} className={`p-6 ${color.bg} rounded-xl`}>
            <h3 className={`font-bold ${color.text} mb-2`}>{tool.name}</h3>
            <p className="text-sm text-brand-secondary">{tool.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

interface ITLAData {
  learningGoals: string[];
  cognitiveEngagement: string;
  selectedModalities: string[];
}

// ITLA Screen
function ITLAScreen({
  data,
  updateData,
}: {
  data: ITLAData;
  updateData: (phase: string, field: string, value: unknown) => void;
}): React.JSX.Element {
  const [newGoal, setNewGoal] = useState('');

  const engagementLevels = [
    { id: 'surface', name: 'Surface Learning', desc: 'Memorization and recall' },
    { id: 'strategic', name: 'Strategic Learning', desc: 'Organized approach to learning' },
    { id: 'deep', name: 'Deep Learning', desc: 'Understanding and critical thinking' },
  ];

  const modalities = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'];

  const addGoal = (): void => {
    if (newGoal.trim()) {
      updateData('itla', 'learningGoals', [...data.learningGoals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const toggleModality = (mod: string): void => {
    const current = data.selectedModalities || [];
    if (current.includes(mod)) {
      updateData(
        'itla',
        'selectedModalities',
        current.filter((m: string) => m !== mod),
      );
    } else {
      updateData('itla', 'selectedModalities', [...current, mod]);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-brand-primary mb-2">
        ITLA - Instructional Target & Learning Architecture
      </h2>
      <p className="text-brand-secondary mb-8">
        Define your learning objectives and cognitive engagement strategy
      </p>

      {/* Learning Goals */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-brand-primary mb-4">Learning Goals</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            className="flex-1 p-3 border-2 border-brand-strong rounded-lg focus:border-brand-primary focus:outline-hidden"
            placeholder="Enter a learning goal..."
          />
          <button
            type="button"
            onClick={addGoal}
            className="px-6 py-3 bg-brand-primary text-brand-primary rounded-lg font-semibold hover:bg-brand-primary-hover"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(data.learningGoals || []).map((goal: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-blue-50 rounded-lg flex items-center justify-between"
            >
              <span className="text-brand-secondary">{goal}</span>
              <button
                type="button"
                onClick={() =>
                  updateData(
                    'itla',
                    'learningGoals',
                    data.learningGoals.filter((_, i) => i !== index),
                  )
                }
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cognitive Engagement */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-brand-primary mb-4">
          Cognitive Engagement Level
        </h3>
        <div className="grid gap-4">
          {engagementLevels.map((level) => (
            <motion.div
              key={level.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => updateData('itla', 'cognitiveEngagement', level.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.cognitiveEngagement === level.id
                  ? 'border-brand-primary bg-blue-50'
                  : 'border-brand-strong hover:border-blue-300'
              }`}
            >
              <div className="font-semibold text-brand-primary">{level.name}</div>
              <div className="text-sm text-brand-secondary">{level.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Modalities */}
      <div>
        <h3 className="text-xl font-semibold text-brand-primary mb-4">Learning Modalities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {modalities.map((mod) => (
            <motion.button
              key={mod}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleModality(mod)}
              className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                (data.selectedModalities || []).includes(mod)
                  ? 'border-brand-primary bg-brand-primary text-brand-primary'
                  : 'border-brand-strong text-brand-secondary hover:border-blue-300'
              }`}
            >
              {mod}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface NPPMData {
  spacedRepetition: boolean;
  retrievalPractice: boolean;
  emotionalArousal: boolean;
  multisensory: boolean;
  [key: string]: boolean;
}

// NPPM Screen
function NPPMScreen({
  data,
  updateData,
}: {
  data: NPPMData;
  updateData: (phase: string, field: string, value: unknown) => void;
}): React.JSX.Element {
  const strategies = [
    { id: 'spacedRepetition', name: 'Spaced Repetition', desc: 'Distribute learning over time' },
    {
      id: 'retrievalPractice',
      name: 'Retrieval Practice',
      desc: 'Active recall strengthens memory',
    },
    {
      id: 'emotionalArousal',
      name: 'Emotional Arousal',
      desc: 'Emotional engagement aids retention',
    },
    { id: 'multisensory', name: 'Multisensory Integration', desc: 'Engage multiple senses' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-brand-primary mb-2">
        NPPM - NeuroPlasticity Principles Matrix
      </h2>
      <p className="text-brand-secondary mb-8">Select neuroplasticity-based learning strategies</p>

      <div className="grid gap-4">
        {strategies.map((strategy) => (
          <motion.div
            key={strategy.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => updateData('nppm', strategy.id, !data[strategy.id])}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              data[strategy.id]
                ? 'border-brand-primary bg-blue-50'
                : 'border-brand-strong hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-brand-primary mb-1">{strategy.name}</div>
                <div className="text-sm text-brand-secondary">{strategy.desc}</div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  data[strategy.id] ? 'border-brand-primary bg-brand-primary' : 'border-gray-400'
                }`}
              >
                {data[strategy.id] && <span className="text-brand-primary text-sm">✓</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface ILMIData {
  primaryModality: string;
  secondaryModality: string;
  deliveryMethods: string[];
}

// ILMI Screen
function ILMIScreen({
  data,
  updateData,
}: {
  data: ILMIData;
  updateData: (phase: string, field: string, value: unknown) => void;
}): React.JSX.Element {
  const modalities = [
    'Visual',
    'Auditory',
    'Kinesthetic',
    'Reading/Writing',
    'Digital Interactive',
  ];
  const deliveryMethods = [
    'Synchronous Online',
    'Asynchronous Online',
    'In-Person',
    'Hybrid',
    'Self-Paced',
    'Cohort-Based',
  ];

  const toggleDelivery = (method: string): void => {
    const current = data.deliveryMethods || [];
    if (current.includes(method)) {
      updateData(
        'ilmi',
        'deliveryMethods',
        current.filter((m: string) => m !== method),
      );
    } else {
      updateData('ilmi', 'deliveryMethods', [...current, method]);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-brand-primary mb-2">
        ILMI - Instructional Learning Modality Interface
      </h2>
      <p className="text-brand-secondary mb-8">
        Select primary and secondary learning modalities and delivery methods
      </p>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-brand-primary mb-4">Primary Modality</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {modalities.map((mod) => (
            <motion.button
              key={mod}
              whileHover={{ scale: 1.05 }}
              onClick={() => updateData('ilmi', 'primaryModality', mod)}
              className={`p-4 rounded-lg border-2 font-semibold ${
                data.primaryModality === mod
                  ? 'border-brand-primary bg-brand-primary text-brand-primary'
                  : 'border-brand-strong text-brand-secondary'
              }`}
            >
              {mod}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-brand-primary mb-4">Secondary Modality</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {modalities.map((mod) => (
            <motion.button
              key={mod}
              whileHover={{ scale: 1.05 }}
              onClick={() => updateData('ilmi', 'secondaryModality', mod)}
              className={`p-4 rounded-lg border-2 font-semibold ${
                data.secondaryModality === mod
                  ? 'border-brand-secondary bg-brand-secondary text-brand-primary'
                  : 'border-brand-strong text-brand-secondary'
              }`}
              disabled={data.primaryModality === mod}
            >
              {mod}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-brand-primary mb-4">Delivery Methods</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {deliveryMethods.map((method) => (
            <motion.button
              key={method}
              whileHover={{ scale: 1.05 }}
              onClick={() => toggleDelivery(method)}
              className={`p-4 rounded-lg border-2 font-semibold ${
                (data.deliveryMethods || []).includes(method)
                  ? 'border-brand-primary bg-brand-primary text-brand-primary'
                  : 'border-brand-strong text-brand-secondary'
              }`}
            >
              {method}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ICESData {
  engagementLevel: string;
  activities: string[];
}

// ICES Screen
function ICESScreen({
  data,
  updateData,
}: {
  data: ICESData;
  updateData: (phase: string, field: string, value: unknown) => void;
}): React.JSX.Element {
  const [newActivity, setNewActivity] = useState('');
  const engagementLevels = ['Low', 'Medium', 'High', 'Very High'];

  const addActivity = (): void => {
    if (newActivity.trim()) {
      updateData('ices', 'activities', [...(data.activities || []), newActivity.trim()]);
      setNewActivity('');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-brand-primary mb-2">
        ICES - Interactive Cognitive Engagement Spectrum
      </h2>
      <p className="text-brand-secondary mb-8">
        Define engagement levels and interactive activities
      </p>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-brand-primary mb-4">Target Engagement Level</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {engagementLevels.map((level) => (
            <motion.button
              key={level}
              whileHover={{ scale: 1.05 }}
              onClick={() => updateData('ices', 'engagementLevel', level)}
              className={`p-4 rounded-lg border-2 font-semibold ${
                data.engagementLevel === level
                  ? 'border-brand-primary bg-brand-primary text-brand-primary'
                  : 'border-brand-strong text-brand-secondary'
              }`}
            >
              {level}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-brand-primary mb-4">Interactive Activities</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addActivity()}
            className="flex-1 p-3 border-2 border-brand-strong rounded-lg focus:border-brand-primary focus:outline-hidden"
            placeholder="Enter an interactive activity..."
          />
          <button
            type="button"
            onClick={addActivity}
            className="px-6 py-3 bg-brand-primary text-brand-primary rounded-lg font-semibold hover:bg-brand-primary-hover"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(data.activities || []).map((activity: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-blue-50 rounded-lg flex items-center justify-between"
            >
              <span className="text-brand-secondary">{activity}</span>
              <button
                type="button"
                onClick={() =>
                  updateData(
                    'ices',
                    'activities',
                    data.activities.filter((_, i) => i !== index),
                  )
                }
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ICLData {
  competencies: string[];
  jobTasks: string[];
}

// ICL Screen
function ICLScreen({
  data,
  updateData,
}: {
  data: ICLData;
  updateData: (phase: string, field: string, value: unknown) => void;
}): React.JSX.Element {
  const [newCompetency, setNewCompetency] = useState('');
  const [newTask, setNewTask] = useState('');

  const addCompetency = (): void => {
    if (newCompetency.trim()) {
      updateData('icl', 'competencies', [...(data.competencies || []), newCompetency.trim()]);
      setNewCompetency('');
    }
  };

  const addTask = (): void => {
    if (newTask.trim()) {
      updateData('icl', 'jobTasks', [...(data.jobTasks || []), newTask.trim()]);
      setNewTask('');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-brand-primary mb-2">
        ICL - Instructional Competency Lattice
      </h2>
      <p className="text-brand-secondary mb-8">Map competencies to job tasks</p>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-brand-primary mb-4">Core Competencies</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCompetency}
            onChange={(e) => setNewCompetency(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCompetency()}
            className="flex-1 p-3 border-2 border-brand-strong rounded-lg focus:border-brand-secondary focus:outline-hidden"
            placeholder="Enter a competency..."
          />
          <button
            type="button"
            onClick={addCompetency}
            className="px-6 py-3 bg-brand-secondary text-brand-primary rounded-lg font-semibold hover:bg-brand-secondary-hover"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(data.competencies || []).map((comp: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-purple-50 rounded-lg flex items-center justify-between"
            >
              <span className="text-brand-secondary">{comp}</span>
              <button
                type="button"
                onClick={() =>
                  updateData(
                    'icl',
                    'competencies',
                    data.competencies.filter((_, i) => i !== index),
                  )
                }
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-brand-primary mb-4">Job Tasks</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="flex-1 p-3 border-2 border-brand-strong rounded-lg focus:border-brand-secondary focus:outline-hidden"
            placeholder="Enter a job task..."
          />
          <button
            type="button"
            onClick={addTask}
            className="px-6 py-3 bg-brand-secondary text-brand-primary rounded-lg font-semibold hover:bg-brand-secondary-hover"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(data.jobTasks || []).map((task: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-purple-50 rounded-lg flex items-center justify-between"
            >
              <span className="text-brand-secondary">{task}</span>
              <button
                type="button"
                onClick={() =>
                  updateData(
                    'icl',
                    'jobTasks',
                    data.jobTasks.filter((_, i) => i !== index),
                  )
                }
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Placeholder Component for remaining tools
function ToolPlaceholder({
  title,
  phase,
  color = 'blue',
}: {
  title: string;
  phase: string;
  color?: string;
}): React.JSX.Element {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-600/10 to-blue-400/10',
    purple: 'from-purple-600/10 to-purple-400/10',
    pink: 'from-pink-600/10 to-pink-400/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="text-6xl mb-4">🔧</div>
      <h2 className="text-3xl font-bold text-brand-primary mb-4">{title}</h2>
      <p className="text-brand-secondary mb-8">This tool is part of the {phase} phase</p>
      <div
        className={`p-6 bg-linear-to-r ${colorClasses[color]} rounded-xl inline-block max-w-2xl`}
      >
        <p className="text-brand-secondary">
          <strong>Coming Soon:</strong> Full implementation will aggregate and visualize data from
          previous steps.
        </p>
      </div>
    </motion.div>
  );
}

interface WizardData {
  itla: ITLAData;
  nppm: NPPMData;
  ilmi: ILMIData;
  ices: ICESData;
  icl: ICLData;
  ipmg: Record<string, unknown>;
  icdt: Record<string, unknown>;
  icpf: Record<string, unknown>;
  idns: Record<string, unknown>;
  iadc: Record<string, unknown>;
  ilem: Record<string, unknown>;
  ialm: Record<string, unknown>;
}

// Summary Screen
function SummaryScreen({ data }: { data: WizardData }): React.JSX.Element {
  const exportData = (): void => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inspire-learning-design.json';
    a.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-4xl font-bold text-brand-primary mb-4">INSPIRE Framework Complete!</h2>
        <p className="text-xl text-brand-secondary">
          You&apos;ve completed the entire learning experience design process
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-blue-50 rounded-xl">
          <h3 className="font-bold text-blue-800 mb-3 text-lg">Phase 1: Encoding</h3>
          <ul className="text-sm text-brand-secondary space-y-2">
            <li>✓ ITLA: {data.itla.learningGoals?.length || 0} goals defined</li>
            <li>✓ NPPM: Memory strategies selected</li>
            <li>✓ ILMI: {data.ilmi.primaryModality || 'Not set'}</li>
            <li>✓ ICES: {data.ices.engagementLevel || 'Not set'} engagement</li>
          </ul>
        </div>

        <div className="p-6 bg-purple-50 rounded-xl">
          <h3 className="font-bold text-purple-800 mb-3 text-lg">Phase 2: Synthesization</h3>
          <ul className="text-sm text-brand-secondary space-y-2">
            <li>✓ ICL: {data.icl.competencies?.length || 0} competencies</li>
            <li>✓ IPMG: Performance mapped</li>
            <li>✓ ICDT: Cognitive levels defined</li>
            <li>✓ ICPF: Progression framework set</li>
          </ul>
        </div>

        <div className="p-6 bg-pink-50 rounded-xl">
          <h3 className="font-bold text-pink-800 mb-3 text-lg">Phase 3: Assimilation</h3>
          <ul className="text-sm text-brand-secondary space-y-2">
            <li>✓ IDNS: Design system configured</li>
            <li>✓ IADC: Adaptive cycle planned</li>
            <li>✓ ILEM: Experience matrix built</li>
            <li>✓ IALM: Assessment strategy set</li>
          </ul>
        </div>
      </div>

      <div className="text-center mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportData}
          className="px-8 py-4 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-brand-primary rounded-lg font-bold text-lg shadow-lg"
        >
          📥 Export Learning Design
        </motion.button>
        <p className="text-sm text-brand-secondary mt-4">
          Download your complete INSPIRE framework data as JSON
        </p>
      </div>

      <div className="p-6 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl">
        <h3 className="font-bold text-brand-primary mb-4 text-center text-lg">Next Steps</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-brand-surface rounded-lg">
            <div className="font-semibold text-brand-primary mb-2">🎨 Design Implementation</div>
            <p className="text-sm text-brand-secondary">
              Use your framework to build the actual learning experience
            </p>
          </div>
          <div className="p-4 bg-brand-surface rounded-lg">
            <div className="font-semibold text-brand-primary mb-2">📊 Stakeholder Review</div>
            <p className="text-sm text-brand-secondary">
              Share with team members and gather feedback
            </p>
          </div>
          <div className="p-4 bg-brand-surface rounded-lg">
            <div className="font-semibold text-brand-primary mb-2">🚀 Development Phase</div>
            <p className="text-sm text-brand-secondary">
              Begin creating content and interactive elements
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Main Wizard Component
export default function InspireWizard(): React.JSX.Element {
  const [currentPhase, setCurrentPhase] = useState('welcome');
  const [wizardData, setWizardData] = useState<WizardData>({
    itla: { learningGoals: [], cognitiveEngagement: '', selectedModalities: [] },
    nppm: {
      spacedRepetition: false,
      retrievalPractice: false,
      emotionalArousal: false,
      multisensory: false,
    },
    ilmi: { primaryModality: '', secondaryModality: '', deliveryMethods: [] },
    ices: { engagementLevel: '', activities: [] },
    icl: { competencies: [], jobTasks: [] },
    ipmg: {},
    icdt: {},
    icpf: {},
    idns: {},
    iadc: {},
    ilem: {},
    ialm: {},
  });

  const phases = [
    { id: 'welcome', name: 'Welcome', category: 'Start' },
    { id: 'encoding-intro', name: 'Encoding Phase', category: 'Phase 1' },
    { id: 'itla', name: 'ITLA', category: 'Encoding' },
    { id: 'nppm', name: 'NPPM', category: 'Encoding' },
    { id: 'ilmi', name: 'ILMI', category: 'Encoding' },
    { id: 'ices', name: 'ICES', category: 'Encoding' },
    { id: 'synthesization-intro', name: 'Synthesization', category: 'Phase 2' },
    { id: 'icl', name: 'ICL', category: 'Synthesization' },
    { id: 'ipmg', name: 'IPMG', category: 'Synthesization' },
    { id: 'icdt', name: 'ICDT', category: 'Synthesization' },
    { id: 'icpf', name: 'ICPF', category: 'Synthesization' },
    { id: 'assimilation-intro', name: 'Assimilation', category: 'Phase 3' },
    { id: 'idns', name: 'IDNS', category: 'Assimilation' },
    { id: 'iadc', name: 'IADC', category: 'Assimilation' },
    { id: 'ilem', name: 'ILEM', category: 'Assimilation' },
    { id: 'ialm', name: 'IALM', category: 'Assimilation' },
    { id: 'summary', name: 'Summary', category: 'Complete' },
  ];

  const currentIndex = phases.findIndex((p) => p.id === currentPhase);

  const updateData = (phase: string, field: string, value: unknown): void => {
    setWizardData((prev) => ({
      ...prev,
      [phase]: {
        ...prev[phase as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const nextPhase = (): void => {
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  };

  const prevPhase = (): void => {
    if (currentIndex > 0) {
      setCurrentPhase(phases[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  };

  const renderPhaseContent = (): React.JSX.Element => {
    switch (currentPhase) {
      case 'welcome':
        return <WelcomeScreen />;

      case 'encoding-intro':
        return (
          <PhaseIntroScreen
            phase="encoding"
            description="Establish the foundation for learning by defining objectives, neuroplasticity principles, modalities, and engagement strategies."
            tools={[
              { name: 'ITLA', description: 'Define learning targets and cognitive architecture' },
              { name: 'NPPM', description: 'Apply neuroplasticity principles for memory' },
              { name: 'ILMI', description: 'Select optimal learning modalities' },
              { name: 'ICES', description: 'Design cognitive engagement strategies' },
            ]}
          />
        );

      case 'itla':
        return <ITLAScreen data={wizardData.itla} updateData={updateData} />;

      case 'nppm':
        return <NPPMScreen data={wizardData.nppm} updateData={updateData} />;

      case 'ilmi':
        return <ILMIScreen data={wizardData.ilmi} updateData={updateData} />;

      case 'ices':
        return <ICESScreen data={wizardData.ices} updateData={updateData} />;

      case 'synthesization-intro':
        return (
          <PhaseIntroScreen
            phase="synthesization"
            description="Map competencies to performance outcomes and establish cognitive frameworks for skill development."
            tools={[
              { name: 'ICL', description: 'Map competencies to job tasks' },
              { name: 'IPMG', description: 'Create performance mappings' },
              { name: 'ICDT', description: 'Define cognitive demand levels' },
              { name: 'ICPF', description: 'Build capability progression paths' },
            ]}
          />
        );

      case 'icl':
        return <ICLScreen data={wizardData.icl} updateData={updateData} />;

      case 'ipmg':
        return (
          <ToolPlaceholder
            title="IPMG - Performance Mapping Grid"
            phase="Synthesization"
            color="purple"
          />
        );

      case 'icdt':
        return (
          <ToolPlaceholder
            title="ICDT - Cognitive Demand Taxonomy"
            phase="Synthesization"
            color="purple"
          />
        );

      case 'icpf':
        return (
          <ToolPlaceholder
            title="ICPF - Capability Progression Framework"
            phase="Synthesization"
            color="purple"
          />
        );

      case 'assimilation-intro':
        return (
          <PhaseIntroScreen
            phase="assimilation"
            description="Design the complete learning experience with adaptive systems, measurement strategies, and implementation plans."
            tools={[
              { name: 'IDNS', description: 'Configure design neurosystem' },
              { name: 'IADC', description: 'Plan adaptive design cycles' },
              { name: 'ILEM', description: 'Build learning experience matrix' },
              { name: 'IALM', description: 'Define adaptive measurement' },
            ]}
          />
        );

      case 'idns':
        return (
          <ToolPlaceholder title="IDNS - Design NeuroSystem" phase="Assimilation" color="pink" />
        );

      case 'iadc':
        return (
          <ToolPlaceholder title="IADC - Adaptive Design Cycle" phase="Assimilation" color="pink" />
        );

      case 'ilem':
        return (
          <ToolPlaceholder
            title="ILEM - Learning Experience Matrix"
            phase="Assimilation"
            color="pink"
          />
        );

      case 'ialm':
        return (
          <ToolPlaceholder
            title="IALM - Adaptive Learning Measurement"
            phase="Assimilation"
            color="pink"
          />
        );

      case 'summary':
        return <SummaryScreen data={wizardData} />;

      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            INSPIRE Learning Experience Design
          </h1>
          <p className="text-brand-secondary text-lg">Neuroscience-Backed Learning Architecture</p>
        </div>

        {/* Progress Bar */}
        <ProgressBar phases={phases} currentIndex={currentIndex} />

        {/* Main Content */}
        <div className="bg-brand-surface rounded-2xl shadow-2xl p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPhaseContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevPhase}
            disabled={currentIndex === 0}
            className={`px-6 py-3 rounded-lg font-semibold ${
              currentIndex === 0
                ? 'bg-gray-300 text-brand-muted cursor-not-allowed'
                : 'bg-gray-600 text-brand-primary hover:bg-brand-surface-hover'
            }`}
          >
            ← Previous
          </motion.button>

          <span className="text-brand-secondary font-medium">{phases[currentIndex].name}</span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextPhase}
            disabled={currentIndex === phases.length - 1}
            className={`px-6 py-3 rounded-lg font-semibold ${
              currentIndex === phases.length - 1
                ? 'bg-gray-300 text-brand-muted cursor-not-allowed'
                : 'bg-linear-to-r from-blue-600 to-purple-600 text-brand-primary hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            Next →
          </motion.button>
        </div>
      </div>
    </div>
  );
}
