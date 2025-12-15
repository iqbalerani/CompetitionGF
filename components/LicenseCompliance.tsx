/**
 * LicenseCompliance Component
 *
 * Displays information about Bria FIBO's unique licensing compliance features
 * This component highlights the commercial safety of generated assets
 */

import React from 'react';
import { ShieldCheck, Award, FileCheck, Sparkles } from 'lucide-react';

interface LicenseComplianceProps {
  assetCount?: number;
}

const LicenseCompliance: React.FC<LicenseComplianceProps> = ({ assetCount = 0 }) => {
  return (
    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <ShieldCheck size={24} className="text-green-400" />
        </div>
        <div>
          <h3 className="font-bold text-green-300 text-sm">Commercial License Compliance</h3>
          <p className="text-[10px] text-green-400/60">Powered by Bria FIBO</p>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <Award size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-300 font-medium">100% Licensed Training Data</p>
            <p className="text-[10px] text-slate-400">
              FIBO is trained exclusively on 1+ billion fully licensed images
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FileCheck size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-300 font-medium">Commercial-Safe Assets</p>
            <p className="text-[10px] text-slate-400">
              All generated assets are safe for commercial game releases
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Sparkles size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-300 font-medium">Zero Legal Risk</p>
            <p className="text-[10px] text-slate-400">
              No copyright concerns from training data
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {assetCount > 0 && (
        <div className="pt-3 border-t border-green-500/20">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400">Licensed Assets Generated:</span>
            <span className="text-sm font-bold text-green-400">{assetCount}</span>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-4 pt-3 border-t border-green-500/20">
        <p className="text-[9px] text-slate-500 text-center">
          GameForge uses Bria's FIBO to ensure all visual assets meet professional
          licensing standards for indie and AAA game development.
        </p>
      </div>
    </div>
  );
};

export default LicenseCompliance;
