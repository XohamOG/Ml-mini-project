import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useCountUp } from '@/hooks/useCountUp'
import { motion } from 'framer-motion'
import SimpleOrb from '@/components/SimpleOrb'

// sample metrics to visualize (placeholder)
const metrics = [
  { name: 'Accuracy', value: 0.94 },
  { name: 'F1-score', value: 0.93 },
  { name: 'Precision', value: 0.92 },
  { name: 'Recall', value: 0.94 },
]

// simple 2x2 confusion matrix example (placeholder counts)
const cm = [
  ['', 'Pred Male', 'Pred Female'],
  ['Actual Male', 120, 10],
  ['Actual Female', 12, 115],
]

export default function Results() {
  const acc = useCountUp(metrics[0].value)
  const f1 = useCountUp(metrics[1].value, 1000)
  const prec = useCountUp(metrics[2].value, 950)
  const rec = useCountUp(metrics[3].value, 980)

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen px-6 py-12 relative"
    >
      {/* Background orb */}
      <SimpleOrb className="opacity-20" />
      
      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        <header>
          <h1 className="funky-title text-3xl md:text-5xl">Model Results</h1>
          <p className="text-muted-foreground mt-2">Visual summaries of your ML model's performance metrics.</p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Accuracy', v: acc },
            { label: 'F1-score', v: f1 },
            { label: 'Precision', v: prec },
            { label: 'Recall', v: rec },
          ].map((k, index) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300 
              }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <Card className="card-pop hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">{k.label}</div>
                  <div className="funky-title text-2xl mt-1">{Math.round(k.v * 100)}%</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-pop">
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                  <Tooltip formatter={(v) => `${Math.round(v * 100)}%`} />
                  <Bar dataKey="value" fill="oklch(0.78 0.12 55)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-pop">
            <CardHeader>
              <CardTitle>Confusion Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 w-full border border-border rounded-lg overflow-hidden">
                {cm.map((row, rIdx) =>
                  row.map((cell, cIdx) => {
                    const isHeader = rIdx === 0 || cIdx === 0
                    const strength = typeof cell === 'number' ? Math.min(1, cell / 130) : 0
                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={[
                          'p-3 text-sm md:text-base border border-border transition-colors duration-200',
                          isHeader ? 'bg-secondary font-medium' : 'hover:bg-muted',
                        ].join(' ')}
                        style={
                          !isHeader
                            ? {
                                background: `color-mix(in oklab, hsl(var(--accent)) ${Math.round(strength * 35)}%, hsl(var(--card)))`,
                              }
                            : undefined
                        }
                        aria-label={isHeader ? String(cell) : undefined}
                      >
                        {typeof cell === 'number' ? cell : cell}
                      </div>
                    )
                  }),
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6">
          <Card className="card-pop">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Metrics shown are placeholders based on your project plan (SVM, Logistic Regression, Random Forest with
              scaling and optional PCA). Connect your trained model and feature extraction pipeline to replace with
              real-time results.
            </CardContent>
          </Card>
        </section>
      </div>
    </motion.main>
  )
}