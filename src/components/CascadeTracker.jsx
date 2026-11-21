import React from 'react';
import { Eye, FileText, MessageSquareQuote, CheckCircle2, AlertCircle, FastForward, Loader2 } from 'lucide-react';

export default function CascadeTracker({ cascadeLog, activeTier, isAnalyzing }) {
  if (!cascadeLog && !isAnalyzing) return null;

  const tiers = [
    {
      num: 1,
      title: 'Tier 1: Watching Reel (Video & Audio)',
      desc: 'Multimodal AI scans storefront signage, cup logos, menu cards & voiceover.',
      icon: Eye,
      iconColor: 'text-[#FF5A36]',
      bgColor: 'bg-[#FF5A36]/15',
      borderColor: 'border-[#FF5A36]/30',
    },
    {
      num: 2,
      title: 'Tier 2: Reel Description & Location Tags',
      desc: 'Inspects caption text, tagged accounts (@), hashtags & Instagram location pins.',
      icon: FileText,
      iconColor: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/15',
      borderColor: 'border-[#F59E0B]/30',
    },
    {
      num: 3,
      title: 'Tier 3: Searching Top Comments & Creator Replies',
      desc: 'Searches Q&A where viewers ask "Where is this?" and creator or viewers answer.',
      icon: MessageSquareQuote,
      iconColor: 'text-[#22C55E]',
      bgColor: 'bg-[#22C55E]/15',
      borderColor: 'border-[#22C55E]/30',
    },
  ];

  return (
    <div className="bg-[#1C1C20] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 sm:p-6 mb-8 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#F4F4F5] tracking-wider uppercase flex items-center gap-2">
            <span>3-Tier Detection Pipeline</span>
            {isAnalyzing && (
              <span className="flex items-center gap-1.5 text-xs text-[#FF5A36] font-semibold lowercase bg-[#FF5A36]/15 px-2.5 py-0.5 rounded-full border border-[#FF5A36]/30">
                <Loader2 className="w-3 h-3 animate-spin" />
                analyzing cascade...
              </span>
            )}
          </h3>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Progressive fallback: Video Scan &rarr; Caption Scan &rarr; Comments Scan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {tiers.map((t) => {
          const logEntry = cascadeLog?.find((l) => l.tier === t.num);
          const isCurrent = isAnalyzing && activeTier === t.num;
          const status = logEntry?.status || (isCurrent ? 'running' : 'waiting');

          let badge = null;
          let containerClass = 'border-[rgba(255,255,255,0.08)] bg-[#242429] text-[#A1A1AA]';

          if (status === 'success') {
            containerClass = 'border-[#22C55E]/40 bg-[#22C55E]/10 shadow-lg shadow-[#22C55E]/10 text-[#F4F4F5]';
            badge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/20 px-2.5 py-0.5 rounded-full border border-[#22C55E]/40">
                <CheckCircle2 className="w-3 h-3" />
                Place Found
              </span>
            );
          } else if (status === 'inconclusive') {
            containerClass = 'border-[#F59E0B]/30 bg-[#F59E0B]/10 opacity-90 text-[#F4F4F5]';
            badge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F59E0B] bg-[#F59E0B]/20 px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30">
                <AlertCircle className="w-3 h-3" />
                Inconclusive
              </span>
            );
          } else if (status === 'skipped') {
            containerClass = 'border-[rgba(255,255,255,0.06)] bg-[#1C1C20] opacity-50 text-[#A1A1AA]';
            badge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A1A1AA] bg-[#242429] px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)]">
                <FastForward className="w-3 h-3" />
                Skipped
              </span>
            );
          } else if (status === 'running') {
            containerClass = 'border-[#FF5A36] bg-[#FF5A36]/10 ring-1 ring-[#FF5A36]/50 shadow-lg shadow-[#FF5A36]/20 animate-pulse text-[#F4F4F5]';
            badge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF5A36] bg-[#FF5A36]/25 px-2.5 py-0.5 rounded-full border border-[#FF5A36]/40">
                <Loader2 className="w-3 h-3 animate-spin" />
                Scanning...
              </span>
            );
          } else {
            badge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A1A1AA] bg-[#1C1C20] px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)]">
                Standby
              </span>
            );
          }

          const IconComponent = t.icon;

          return (
            <div
              key={t.num}
              className={`rounded-[16px] border p-4 transition-all duration-200 flex flex-col justify-between ${containerClass}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-[10px] ${t.bgColor} flex items-center justify-center border ${t.borderColor}`}>
                    <IconComponent className={`w-4 h-4 ${t.iconColor}`} />
                  </div>
                  {badge}
                </div>

                <h4 className="text-sm font-bold text-[#F4F4F5]">{t.title}</h4>
                <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">{t.desc}</p>
              </div>

              {logEntry && (
                <div className="mt-3 pt-2.5 border-t border-[rgba(255,255,255,0.08)] text-xs">
                  {logEntry.status === 'success' && (
                    <div className="space-y-1">
                      <div className="text-[#22C55E] font-bold truncate">
                        🎯 {logEntry.placeName}
                      </div>
                      {logEntry.evidence && (
                        <p className="text-[11px] text-[#F4F4F5] italic line-clamp-2">
                          "{logEntry.evidence}"
                        </p>
                      )}
                    </div>
                  )}
                  {logEntry.status === 'inconclusive' && (
                    <p className="text-[11px] text-[#F59E0B]">
                      {logEntry.reason || 'Name not definitively resolved; fell back to next tier.'}
                    </p>
                  )}
                  {logEntry.status === 'skipped' && (
                    <p className="text-[11px] text-[#A1A1AA]">
                      {logEntry.reason || 'Not required.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
