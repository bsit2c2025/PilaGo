import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { Tv, Volume2, VolumeX, Bike, Users, Clock } from 'lucide-react';

export default function PublicTerminalBoard() {
  const { terminalCode } = useParams();
  const code = terminalCode || 'bayan-central';
  const [boardData, setBoardData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const previousBoardingRef = useRef([]);

  // Play subtle web audio notification chime
  const playChime = () => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio chime blocked or unsupported', e);
    }
  };

  const fetchBoardData = async () => {
    try {
      const res = await api.get(`/public/board/${code}/`);
      const newData = res.data;

      // Check if new boarding entries arrived
      const prevIds = (previousBoardingRef.current || []).map((b) => b.dispatch_number).join(',');
      const newIds = (newData.now_boarding || []).map((b) => b.dispatch_number).join(',');
      if (prevIds !== newIds && newData.now_boarding?.length > 0) {
        playChime();
      }
      previousBoardingRef.current = newData.now_boarding;
      setBoardData(newData);
    } catch (e) {
      console.error('Failed to update public board', e);
    }
  };

  useEffect(() => {
    fetchBoardData();
    const pollInterval = setInterval(fetchBoardData, 3000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    // Setup WebSocket
    let ws;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/terminal/${code}/board/`;
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'board_refresh') {
            fetchBoardData();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(pollInterval);
      clearInterval(timeInterval);
      if (ws) ws.close();
    };
  }, [code]);

  return (
    <div className="min-h-screen bg-[#101923] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* High-Contrast TV Header */}
      <header className="bg-[#172432] border-b border-[#344657] px-8 py-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E5A928] text-gray-950 font-black text-3xl flex items-center justify-center shadow-md">
            PG
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F4F7FA]">
              {boardData?.terminal?.name || 'PilaGo Terminal'}
            </h1>
            <p className="text-xs text-[#B7C4D0] font-semibold flex items-center mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse mr-2" />
              LIVE QUEUE & DISPATCH BOARD
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-3 bg-[#1D2D3D] hover:bg-[#283C52] text-gray-300 rounded-xl transition"
            title={audioEnabled ? 'Mute announcement chime' : 'Enable announcement chime'}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
          </button>

          <div className="text-right border-l border-[#344657] pl-6">
            <div className="text-2xl font-extrabold tabular-nums tracking-wider text-[#F4F7FA]">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-[#B7C4D0] font-medium">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Board Columns */}
      <main className="flex-1 p-8 grid grid-cols-12 gap-8">
        {/* Left Column: NOW BOARDING / DISPATCHED */}
        <section className="col-span-8 bg-[#172432] rounded-3xl border border-[#344657] p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#344657] pb-4 mb-6">
              <span className="text-sm font-extrabold text-[#E5A928] tracking-widest uppercase flex items-center">
                <Bike className="w-5 h-5 mr-2" />
                NOW BOARDING · PROCEED TO BAY
              </span>
              <span className="text-xs font-bold text-gray-400">
                {boardData?.now_boarding?.length || 0} Tricycle(s) at Bays
              </span>
            </div>

            {boardData?.now_boarding?.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {boardData.now_boarding.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#1D2D3D] border-2 border-[#E5A928] rounded-2xl p-6 shadow-xl relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-[#E5A928] text-gray-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                        Tricycle #{item.body_number}
                      </div>
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                        BAY 1
                      </span>
                    </div>

                    <div className="mb-4">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Called Queue Numbers
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.queue_numbers?.map((num, i) => (
                          <span
                            key={i}
                            className="bg-[#101923] text-white font-black text-2xl px-4 py-2 rounded-xl border border-gray-700 tabular-nums shadow-inner"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-700/60 pt-3 flex justify-between text-xs text-gray-400">
                      <span>Driver: <strong className="text-white">{item.driver_name}</strong></span>
                      <span>Plate: <strong className="text-white">{item.plate_number}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-3">
                <Clock className="w-12 h-12 text-gray-600 mx-auto animate-pulse" />
                <h3 className="text-xl font-bold text-gray-400">All Tricycles Dispatched</h3>
                <p className="text-xs text-gray-500">
                  Waiting for next regular passenger batch or driver arrival.
                </p>
              </div>
            )}
          </div>

          {/* Footer Terminal Stats Banner */}
          <div className="bg-[#101923] rounded-2xl p-4 border border-[#344657] flex justify-around text-center text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Regular Waiting</span>
              <span className="text-2xl font-extrabold text-white tabular-nums">
                {boardData?.waiting_regular_count || 0}
              </span>
            </div>
            <div className="border-r border-gray-800" />
            <div>
              <span className="text-gray-400 block text-[11px]">Special Waiting</span>
              <span className="text-2xl font-extrabold text-[#E5A928] tabular-nums">
                {boardData?.waiting_special_count || 0}
              </span>
            </div>
            <div className="border-r border-gray-800" />
            <div>
              <span className="text-gray-400 block text-[11px]">Available Tricycles</span>
              <span className="text-2xl font-extrabold text-emerald-400 tabular-nums">
                {boardData?.available_drivers_count || 0}
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: UPCOMING IN LINE */}
        <section className="col-span-4 bg-[#172432] rounded-3xl border border-[#344657] p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="border-b border-[#344657] pb-4 mb-6">
              <span className="text-sm font-extrabold text-gray-300 tracking-widest uppercase flex items-center">
                <Users className="w-5 h-5 mr-2 text-brand-500" />
                UPCOMING IN LINE
              </span>
            </div>

            {/* Regular Queue Column */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
                  Regular Shared Queue
                </span>
                {boardData?.upcoming_regular?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {boardData.upcoming_regular.map((num, i) => (
                      <div
                        key={i}
                        className="bg-[#1D2D3D] text-[#F4F7FA] font-extrabold text-xl py-3 px-4 rounded-xl border border-gray-700 text-center tabular-nums shadow-sm"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic py-2">Queue is clear</div>
                )}
              </div>

              {/* Special Queue Column */}
              <div className="pt-4 border-t border-[#344657]">
                <span className="text-xs font-bold text-[#E5A928] uppercase tracking-wider block mb-2.5">
                  Special Solo Queue
                </span>
                {boardData?.upcoming_special?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {boardData.upcoming_special.map((num, i) => (
                      <div
                        key={i}
                        className="bg-[#1D2D3D] text-[#E5A928] font-extrabold text-xl py-3 px-4 rounded-xl border border-amber-900/40 text-center tabular-nums shadow-sm"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic py-2">No special requests</div>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 text-center pt-4">
            PilaGo Municipal Transit System · Fair & Transparent Turns
          </div>
        </section>
      </main>
    </div>
  );
}
