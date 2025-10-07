import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Sparkles, TrendingUp, Target, Activity, Upload, Play } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import SimpleOrb from '../components/SimpleOrb'
import AnimatedButton from '../components/AnimatedButton'

// Mock data for demonstration
const accuracyData = [
  { epoch: 1, accuracy: 65, validation: 62 },
  { epoch: 2, accuracy: 72, validation: 69 },
  { epoch: 3, accuracy: 78, validation: 75 },
  { epoch: 4, accuracy: 83, validation: 80 },
  { epoch: 5, accuracy: 87, validation: 84 },
  { epoch: 6, accuracy: 90, validation: 87 },
  { epoch: 7, accuracy: 92, validation: 89 },
  { epoch: 8, accuracy: 94, validation: 91 },
  { epoch: 9, accuracy: 95, validation: 93 },
  { epoch: 10, accuracy: 96, validation: 94 },
]

const lossData = [
  { epoch: 1, loss: 0.9, val_loss: 0.95 },
  { epoch: 2, loss: 0.7, val_loss: 0.75 },
  { epoch: 3, loss: 0.5, val_loss: 0.55 },
  { epoch: 4, loss: 0.35, val_loss: 0.42 },
  { epoch: 5, loss: 0.25, val_loss: 0.32 },
  { epoch: 6, loss: 0.18, val_loss: 0.25 },
  { epoch: 7, loss: 0.12, val_loss: 0.18 },
  { epoch: 8, loss: 0.08, val_loss: 0.15 },
  { epoch: 9, loss: 0.06, val_loss: 0.12 },
  { epoch: 10, loss: 0.04, val_loss: 0.10 },
]

const getConfusionMatrixData = (isDark) => [
  { name: 'Happy', value: 245, color: isDark ? '#ffffff' : '#8b5a2b' },
  { name: 'Sad', value: 189, color: isDark ? '#e0e0e0' : '#a0692e' },
  { name: 'Angry', value: 167, color: isDark ? '#c0c0c0' : '#b8844a' },
  { name: 'Neutral', value: 203, color: isDark ? '#a0a0a0' : '#d2b07d' },
  { name: 'Fear', value: 98, color: isDark ? '#808080' : '#e0caa4' },
]

const precisionRecallData = [
  { emotion: 'Happy', precision: 0.94, recall: 0.92, f1: 0.93 },
  { emotion: 'Sad', precision: 0.89, recall: 0.91, f1: 0.90 },
  { emotion: 'Angry', precision: 0.87, recall: 0.85, f1: 0.86 },
  { emotion: 'Neutral', precision: 0.93, recall: 0.89, f1: 0.91 },
  { emotion: 'Fear', precision: 0.82, recall: 0.79, f1: 0.81 },
]

export default function Results() {
  const { isDark } = useTheme()
  const confusionMatrixData = getConfusionMatrixData(isDark)
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const handleUpdateDataset = async () => {
    // Mock API call for dataset update
    console.log('Updating dataset...')
    // You would implement actual API call here
  }

  const handleTrainModel = async () => {
    // Mock API call for model training
    console.log('Starting model training...')
    // You would implement actual API call here
  }

  return (
    <motion.main 
      className="min-h-screen relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <SimpleOrb />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-5xl font-bold mb-4 funky-title bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent dark:from-white dark:to-gray-300"
            whileHover={{
              scale: 1.02,
              transition: { type: "spring", stiffness: 300 }
            }}
          >
            Model Performance
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Comprehensive analysis of your ML model's performance metrics
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-wrap gap-4 justify-center mb-12"
          variants={itemVariants}
        >
          <AnimatedButton
            onClick={handleUpdateDataset}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Update Dataset
          </AnimatedButton>
          <AnimatedButton
            onClick={handleTrainModel}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-4 h-4 mr-2" />
            Train Model
          </AnimatedButton>
        </motion.div>

        {/* Original Metrics Cards */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
        >
          <motion.div 
            className="card-pop p-6 text-center"
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full ${
              isDark 
                ? 'bg-gradient-to-r from-white to-gray-200' 
                : 'bg-gradient-to-r from-beige-400 to-beige-600'
            }`}>
              <Target className={`w-6 h-6 ${isDark ? 'text-black' : 'text-white'}`} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Accuracy</h3>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-beige-700'}`}>96.2%</p>
            <p className="text-sm text-muted-foreground mt-1">Overall model accuracy</p>
          </motion.div>

          <motion.div 
            className="card-pop p-6 text-center"
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full ${
              isDark 
                ? 'bg-gradient-to-r from-white to-gray-200' 
                : 'bg-gradient-to-r from-beige-400 to-beige-600'
            }`}>
              <TrendingUp className={`w-6 h-6 ${isDark ? 'text-black' : 'text-white'}`} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Precision</h3>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-beige-700'}`}>94.8%</p>
            <p className="text-sm text-muted-foreground mt-1">Weighted average precision</p>
          </motion.div>

          <motion.div 
            className="card-pop p-6 text-center"
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full ${
              isDark 
                ? 'bg-gradient-to-r from-white to-gray-200' 
                : 'bg-gradient-to-r from-beige-400 to-beige-600'
            }`}>
              <Activity className={`w-6 h-6 ${isDark ? 'text-black' : 'text-white'}`} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Recall</h3>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-beige-700'}`}>93.1%</p>
            <p className="text-sm text-muted-foreground mt-1">Weighted average recall</p>
          </motion.div>

          <motion.div 
            className="card-pop p-6 text-center"
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full ${
              isDark 
                ? 'bg-gradient-to-r from-white to-gray-200' 
                : 'bg-gradient-to-r from-beige-400 to-beige-600'
            }`}>
              <Sparkles className={`w-6 h-6 ${isDark ? 'text-black' : 'text-white'}`} />
            </div>
            <h3 className="text-lg font-semibold mb-2">F1-Score</h3>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-beige-700'}`}>93.9%</p>
            <p className="text-sm text-muted-foreground mt-1">Harmonic mean of precision and recall</p>
          </motion.div>
        </motion.div>

        {/* Individual Metric Graphs */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-8 mb-12"
          variants={containerVariants}
        >
          {/* Accuracy Over Time */}
          <motion.div 
            className="card-pop p-6"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className={`w-5 h-5 mr-2 ${isDark ? 'text-white' : 'text-beige-700'}`} />
              Training Accuracy
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="epoch" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke={isDark ? '#ffffff' : '#8b5a2b'} 
                  strokeWidth={3} 
                  dot={{ fill: isDark ? '#ffffff' : '#8b5a2b', strokeWidth: 2, r: 4 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="validation" 
                  stroke={isDark ? '#cccccc' : '#a0692e'} 
                  strokeWidth={3} 
                  dot={{ fill: isDark ? '#cccccc' : '#a0692e', strokeWidth: 2, r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Loss Over Time */}
          <motion.div 
            className="card-pop p-6"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className={`w-5 h-5 mr-2 ${isDark ? 'text-white' : 'text-beige-700'}`} />
              Training Loss
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lossData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="epoch" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="loss" 
                  stroke={isDark ? '#ffffff' : '#8b5a2b'} 
                  strokeWidth={3} 
                  dot={{ fill: isDark ? '#ffffff' : '#8b5a2b', strokeWidth: 2, r: 4 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="val_loss" 
                  stroke={isDark ? '#cccccc' : '#a0692e'} 
                  strokeWidth={3} 
                  dot={{ fill: isDark ? '#cccccc' : '#a0692e', strokeWidth: 2, r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Precision, Recall, F1 per Class */}
          <motion.div 
            className="card-pop p-6"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Target className={`w-5 h-5 mr-2 ${isDark ? 'text-white' : 'text-beige-700'}`} />
              Per-Class Metrics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={precisionRecallData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="emotion" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
                <Bar 
                  dataKey="precision" 
                  fill={isDark ? '#ffffff' : '#8b5a2b'} 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="recall" 
                  fill={isDark ? '#cccccc' : '#a0692e'} 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="f1" 
                  fill={isDark ? '#999999' : '#b8844a'} 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Class Distribution */}
          <motion.div 
            className="card-pop p-6"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Sparkles className={`w-5 h-5 mr-2 ${isDark ? 'text-white' : 'text-beige-700'}`} />
              Class Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={confusionMatrixData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {confusionMatrixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>

        {/* Training Status */}
        <motion.div 
          className="card-pop p-8 text-center"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full ${
            isDark 
              ? 'bg-gradient-to-r from-white to-gray-200' 
              : 'bg-gradient-to-r from-beige-400 to-beige-600'
          }`}>
            <Sparkles className={`w-8 h-8 ${isDark ? 'text-black' : 'text-white'}`} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Model Training Complete!</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your emotion recognition model has been successfully trained with excellent performance metrics. 
            The model achieved 96.2% accuracy with balanced precision and recall across all emotion classes.
          </p>
        </motion.div>
      </div>
    </motion.main>
  )
}