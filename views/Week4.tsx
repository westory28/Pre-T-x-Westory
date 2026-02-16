import React from 'react';
import Layout from '../components/Layout';
import { Award } from 'lucide-react';

const Week4: React.FC = () => {
  return (
    <Layout title="Week 4: 명예의 전당">
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-center">
         <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-stone-600">
          <Award className="w-10 h-10 text-stone-500" />
        </div>
        <h2 className="text-3xl font-bold text-amber-600 mb-4">Final Stage</h2>
        <p className="text-stone-400 max-w-md">
          Pre-T x Westory의 모든 여정을 마친 후 공개됩니다.
        </p>
      </div>
    </Layout>
  );
};

export default Week4;