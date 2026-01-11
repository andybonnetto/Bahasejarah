import React, { useRef, useMemo, useEffect } from 'react';
import { getLanguageColor, getLanguageStartYears } from '../utils/colorUtils';

const RegionHistoryPanel = ({ regionId, regionName, regionTimeline, languageDefs, onClose, onLanguageClick, currentYear }) => {
    const containerRef = useRef(null);

    // Constants for timeline
    const MIN_YEAR = -2000;
    const MAX_YEAR = 2026;
    const TOTAL_DURATION = MAX_YEAR - MIN_YEAR;
    const ROW_HEIGHT = 40;

    if (!regionId || !regionTimeline) return null;

    // Memoize start years
    const startYears = useMemo(() => getLanguageStartYears(regionTimeline), [regionTimeline]);

    const historyList = useMemo(() => {
        const regional = regionTimeline.regions[regionId] || [];
        const globalInfo = regionTimeline.regions['all'] || [];

        // Combine them. Since we pruned redundant ones, we can just concat.
        // However, we want to be safe against duplicates if they exist.
        // Also, sorting by year is needed.
        const combined = [...globalInfo, ...regional];

        // Remove duplicates based on languageId AND startYear (simple dedup)
        const seen = new Set();
        return combined.filter(item => {
            const key = `${item.languageId}-${item.startYear}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [regionId, regionTimeline]);

    // Calculate positions and rows
    const { segments, totalHeight } = useMemo(() => {
        const sorted = [...historyList].sort((a, b) => a.startYear - b.startYear);

        // Identify Unique Languages and their first appearance
        const languageOrder = new Map(); // languageId -> rowIndex
        const uniqueIds = [];

        sorted.forEach(item => {
            if (!languageOrder.has(item.languageId)) {
                languageOrder.set(item.languageId, uniqueIds.length);
                uniqueIds.push(item.languageId);
            }
        });

        const processedSegments = sorted.map(item => {
            const start = Math.max(item.startYear, MIN_YEAR);
            const end = item.endYear === null ? MAX_YEAR : item.endYear;

            const left = ((start - MIN_YEAR) / TOTAL_DURATION) * 100;
            const duration = end - start;
            const widthPercent = (duration / TOTAL_DURATION) * 100;

            const langDef = languageDefs[item.languageId];

            // Determine Row Index based on Language ID
            const rowIndex = languageOrder.get(item.languageId);

            // Determine Active State
            const isActive = currentYear >= item.startYear && (item.endYear === null || currentYear < item.endYear);

            // Calculate Color
            const color = getLanguageColor(item.languageId, currentYear, languageDefs, startYears, { overrideOpacity: 1 });

            return {
                ...item,
                langDef,
                left,
                width: Math.max(widthPercent, 0.5),
                rowIndex,
                isActive,
                label: langDef ? langDef.name : item.languageId,
                displayColor: color
            };
        });

        return {
            segments: processedSegments,
            totalHeight: (uniqueIds.length * ROW_HEIGHT) + 40
        };
    }, [historyList, languageDefs, currentYear, startYears]);


    // Generate Axis Ticks
    const ticks = [];
    for (let year = MIN_YEAR; year <= MAX_YEAR; year += 500) {
        ticks.push({
            year,
            left: ((year - MIN_YEAR) / TOTAL_DURATION) * 100,
            label: year < 0 ? `${Math.abs(year)} BC` : `${year} AD`
        });
    }

    // Auto-scroll to active element
    useEffect(() => {
        if (containerRef.current) {
            const activeElement = containerRef.current.querySelector('.timeline-segment.active');
            if (activeElement) {
                // Determine container width
                const containerWidth = containerRef.current.clientWidth;
                // Determine element position relative to container
                const elementLeft = activeElement.offsetLeft;
                const elementWidth = activeElement.offsetWidth;

                // Calculate centered scroll position
                const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);

                // Scroll only the container
                containerRef.current.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentYear, regionId]); // Re-run when year or region changes

    return (
        <div className="region-history-panel">
            <div className="history-header">
                <h2>{regionName} History</h2>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="timeline-container" ref={containerRef} style={{ overflowX: 'auto' }}>
                <div className="timeline-wrapper" style={{ height: `${totalHeight}px`, minWidth: '2000px' }}>
                    {/* Axis Lines */}
                    {ticks.map(tick => {
                        const left = ((tick.year - MIN_YEAR) / TOTAL_DURATION) * 100;
                        return (
                            <div key={tick.year} className="axis-line" style={{ left: `${left}%` }}>
                                <span className="axis-label">{Math.abs(tick.year)} {tick.year < 0 ? 'BC' : 'AD'}</span>
                            </div>
                        );
                    })}

                    {/* Timeline Segments */}
                    {segments.map((seg, index) => (
                        <div
                            key={`${seg.languageId}-${index}`}
                            className={`timeline-segment ${seg.isActive ? 'active' : ''}`}
                            style={{
                                left: `${seg.left}%`,
                                width: `${seg.width}%`,
                                top: `${seg.rowIndex * ROW_HEIGHT + 10}px`,
                                backgroundColor: seg.displayColor, // Use calculated color
                                opacity: seg.isActive ? 1 : 0.6
                            }}
                            title={`${seg.langDef ? seg.langDef.name : seg.languageId} (${seg.startYear} - ${seg.endYear || 'Present'})`}
                            onClick={() => onLanguageClick({ ...seg.langDef, id: seg.languageId })}
                        >
                            <span className="segment-label">
                                {seg.label}
                            </span>
                        </div>
                    ))}

                    {/* Current Year Marker */}
                    <div
                        className="current-year-marker"
                        style={{ left: `${((currentYear - MIN_YEAR) / TOTAL_DURATION) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default RegionHistoryPanel;
