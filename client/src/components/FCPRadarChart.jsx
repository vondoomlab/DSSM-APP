import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const LABELS = ['O1: Pigment', 'O2: Ornaments', 'O3: Engravings', 'O4: Port. Anchors', 'O5: Architecture', 'O6: Standardization'];

export default function FCPRadarChart({ eScores, sScores, siteName }) {
  if (!eScores || !sScores) return null;

  const data = {
    labels: LABELS,
    datasets: [
      {
        label: 'Evidence (E)',
        data: eScores,
        backgroundColor: 'rgba(212,160,23,0.15)',
        borderColor: '#d4a017',
        borderWidth: 2,
        pointBackgroundColor: '#d4a017',
      },
      {
        label: 'Symbolic (S)',
        data: sScores,
        backgroundColor: 'rgba(139,105,20,0.15)',
        borderColor: '#8b6914',
        borderWidth: 2,
        pointBackgroundColor: '#8b6914',
        borderDash: [5, 3],
      }
    ]
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 2,
        ticks: { stepSize: 1, color: '#a08040', backdropColor: 'transparent' },
        grid: { color: '#3d2800' },
        angleLines: { color: '#3d2800' },
        pointLabels: { color: '#d4a017', font: { size: 11 } }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#e8d5a3' }
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.raw}/2`
        }
      }
    }
  };

  return (
    <div style={{ background: '#1a0f00', border: '1px solid #3d2800', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
      <div style={{ fontSize: '0.8rem', color: '#a08040', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
        FCP 2D RADAR — {siteName || 'SITE'}
      </div>
      <Radar data={data} options={options} />
    </div>
  );
}
