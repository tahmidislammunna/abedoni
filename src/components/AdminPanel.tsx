import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  Send, 
  MessageSquare, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Settings,
  ShieldCheck,
  Save,
  CheckCircle,
  ArrowLeft,
  FileText,
  Smartphone,
  ExternalLink,
  Printer,
  AlertTriangle,
  XCircle,
  Megaphone,
  Globe,
  Sliders,
  HelpCircle,
  Sparkles,
  LogOut
} from 'lucide-react';
import { BoardChallengeOrder, OrderStatus, EducationBoard } from '../types';
import { BOARDS_LIST, generateFirstSmsCommand, generateSecondSmsCommand } from '../data/boardsAndSubjects';
import { getAppSettings, saveAppSettings, AppSettings } from '../data/appSettings';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [settingsSubTab, setSettingsSubTab] = useState<'branding' | 'payments' | 'support' | 'policies' | 'system'>('branding');
  
  const [orders, setOrders] = useState<BoardChallengeOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [boardFilter, setBoardFilter] = useState<string>('ALL');
  
  // App Settings State (WordPress-like customizer)
  const [appSettings, setAppSettings] = useState<AppSettings>(getAppSettings());
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string>('');

  // Single Dedicated Order Page State
  const [selectedOrder, setSelectedOrder] = useState<BoardChallengeOrder | null>(null);
  const [inputPin, setInputPin] = useState<string>('');
  const [boardReply1Input, setBoardReply1Input] = useState<string>('');
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Status Change Confirmation Modal State
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    orderId: string;
    targetStatus: OrderStatus;
    targetPaymentStatus: string;
    pin?: string;
    boardReply1?: string;
    note?: string;
  } | null>(null);

  useEffect(() => {
    if (selectedOrder) {
      setInputPin(selectedOrder.teletalkPin || '');
      setBoardReply1Input(selectedOrder.boardReply1 || '');
      setAdminNoteInput(selectedOrder.adminNotes || '');
    }
  }, [selectedOrder?.id]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/orders?';
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (boardFilter !== 'ALL') url += `board=${boardFilter}&`;

      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter, boardFilter]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveAppSettings(appSettings);
    setAppSettings(updated);
    setSettingsSavedMessage('সকল সেটিংস সফলভাবে আপডেট ও সেভ করা হয়েছে!');
    setTimeout(() => setSettingsSavedMessage(''), 3500);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Metrics Calculations
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter(o => o.orderStatus === 'Pending').length;
  const processingCount = orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Payment Verified').length;
  const completedCount = orders.filter(o => o.orderStatus === 'Completed').length;
  const totalRevenueBDT = orders.reduce((sum, o) => sum + (o.totalFee || 0), 0);

  const handleUpdateOrderStatus = async (
    orderId: string, 
    newStatus: OrderStatus, 
    pin?: string, 
    note?: string,
    paymentStat: string = 'Paid',
    boardReply1?: string
  ) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newStatus,
          paymentStatus: paymentStat,
          teletalkPin: pin,
          boardReply1: boardReply1,
          adminNotes: note || 'Written Processing by Abedoni',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(orders.map(o => o.id === orderId ? data.order : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdating(false);
      setConfirmModalData(null);
    }
  };

  const requestStatusChangeWithConfirmation = (
    orderId: string,
    targetStatus: OrderStatus,
    targetPaymentStatus: string = 'Paid',
    pin?: string,
    boardReply1?: string,
    note?: string
  ) => {
    setConfirmModalData({
      isOpen: true,
      orderId,
      targetStatus,
      targetPaymentStatus,
      pin,
      boardReply1,
      note,
    });
  };

  // WhatsApp One-Click Message Generator for every single step
  const getStepWhatsappUrl = (order: BoardChallengeOrder, step: 'received' | 'processing' | 'pin' | 'completed' | 'issue') => {
    const studentPhone = order.whatsapp || order.phone;
    const cleanPhone = studentPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const siteUrl = window.location.origin;

    let text = '';
    if (step === 'received') {
      text = `প্রিয় ${order.studentName}, আবেদনী (Abedoni)-তে আপনার ${order.board} বোর্ডের SSC বোর্ড চ্যালেঞ্জ ফি (৳${order.totalFee}) সফলভাবে প্রাপ্ত হয়েছে। Order ID: ${order.id}। ট্র্যাকিং লিংক: ${siteUrl}`;
    } else if (step === 'processing') {
      text = `প্রিয় ${order.studentName}, আপনার বোর্ড চ্যালেঞ্জ আবেদনটি (ID: ${order.id}, Roll: ${order.roll}) সফলভাবে প্রসেসিংয়ে রয়েছে (Written Processing by Abedoni)। কোনো চিন্তা নেই, খুব দ্রুতই টেলিটকে জমা দেওয়া হবে।`;
    } else if (step === 'pin') {
      text = `প্রিয় ${order.studentName}, আপনার आवेदনী আবেদনের ১ম ধাপ টেলিটক সার্ভারে সাবমিট করা হয়েছে। TeleTalk PIN: ${order.teletalkPin || inputPin || 'N/A'}। ২য় কনফার্মেশন চূড়ান্ত করা হচ্ছে।`;
    } else if (step === 'completed') {
      text = `অভিনন্দন ${order.studentName}! আপনার SSC বোর্ড চ্যালেঞ্জ আবেদনটি সফলভাবে শিক্ষা বোর্ডে জমা হয়েছে। Order ID: ${order.id}। আপনার অনলাইন ডিজিটাল ট্র্যাকিং রসিদ দেখতে ভিজিট করুন: ${siteUrl}`;
    } else if (step === 'issue') {
      text = `প্রিয় ${order.studentName}, আপনার আবেদনের প্রদানকৃত TrxID (${order.trxId}) বা পেমেন্ট তথ্যে অসঙ্গতি পাওয়া গেছে। অনুগ্রহ করে সঠিক তথ্যের স্ক্রিনশট পাঠিয়ে আমাদের সাথে যোগাযোগ করুন। Order ID: ${order.id}`;
    }

    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-8 pb-20 font-bn max-w-7xl mx-auto">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              আবেদনী অ্যাডমিন কন্ট্রোল প্যানেল
            </h1>
            <span className="bg-slate-900 text-white text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
              ADMIN V2.8
            </span>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm">
            SSC Board Challenge 2026 পেমেন্ট ভেরিফিকেশন, টেলিটক অটো-কমান্ড, ওয়াটসঅ্যাপ API এবং ওয়ার্ডপ্রেস-স্টাইল কাস্টমাইজার
          </p>
        </div>

        {/* Tab Switcher (Orders vs Settings) */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1 rounded-2xl">
          <button
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders' && !selectedOrder ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>অর্ডার রিকোয়েস্ট ({totalOrdersCount})</span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); setSelectedOrder(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>ওয়ার্ডপ্রেস সেটিংস কাস্টমাইজার</span>
          </button>

          <button
            onClick={() => {
              sessionStorage.removeItem('abedoni_admin_authed');
              window.location.href = '/';
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs ml-auto sm:ml-0"
            title="Exit Admin Panel & Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট / বের হন</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. DEDICATED SINGLE ORDER MANAGEMENT PAGE VIEW */}
      {/* ------------------------------------------------------------- */}
      {selectedOrder ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Back Button & Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white/80 shadow-md">
            <button
              onClick={() => setSelectedOrder(null)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>← সকল অর্ডার তালিকায় ফিরে যান</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Order ID:</span>
              <span className="text-sm font-black text-blue-700 font-mono bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                {selectedOrder.id}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full border bg-amber-100 text-amber-900 border-amber-300">
                {selectedOrder.adminNotes || 'Written Processing by Abedoni'}
              </span>
            </div>
          </div>

          {/* Main 2-Column Single Order Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Student Profile & SMS Command Generators */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Student Application Summary */}
              <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[32px] border border-white/80 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>শিক্ষার্থী ও আবেদনের বিবরণ</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    তারিখ: {new Date(selectedOrder.createdAt).toLocaleString('bn-BD')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <span className="text-slate-500 text-xs block font-bold">শিক্ষার্থীর নাম:</span>
                    <span className="font-extrabold text-slate-900 text-base">{selectedOrder.studentName}</span>
                    {selectedOrder.fatherName && <p className="text-slate-600 text-xs">পিতা: {selectedOrder.fatherName}</p>}
                    {selectedOrder.motherName && <p className="text-slate-600 text-xs">মাতা: {selectedOrder.motherName}</p>}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <span className="text-slate-500 text-xs block font-bold">পরীক্ষার তথ্য:</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white font-mono font-bold px-2.5 py-0.5 rounded-lg text-xs">
                        রোল: {selectedOrder.roll}
                      </span>
                      <span className="bg-slate-200 text-slate-800 font-mono font-bold px-2.5 py-0.5 rounded-lg text-xs">
                        রেজি: {selectedOrder.reg}
                      </span>
                    </div>
                    <p className="text-blue-800 font-bold text-xs pt-1">
                      বোর্ড: {selectedOrder.board} ({selectedOrder.exam || 'SSC'} - {selectedOrder.year || 2026})
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <span className="text-slate-500 text-xs block font-bold">যোগাযোগের নম্বর:</span>
                    <p className="font-mono font-bold text-slate-900">{selectedOrder.phone} (মোবাইল)</p>
                    <p className="font-mono text-emerald-700 font-bold">{selectedOrder.whatsapp || selectedOrder.phone} (WhatsApp)</p>
                  </div>

                  <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                    <span className="text-emerald-800 text-xs block font-bold">পেমেন্ট বিবরণী:</span>
                    <p className="font-extrabold text-emerald-900 text-lg font-mono">৳{selectedOrder.totalFee} BDT</p>
                    <p className="font-mono text-xs text-emerald-800">
                      TrxID: <strong className="font-bold">{selectedOrder.trxId}</strong> ({selectedOrder.paymentMethod})
                    </p>
                  </div>
                </div>

                {/* Selected Subjects List */}
                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 space-y-2">
                  <span className="text-xs font-bold text-blue-900 block">
                    আবেদনকৃত বিষয়সমূহ ({selectedOrder.subjects.length} টি বিষয়):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.subjects.map((code, idx) => (
                      <span key={code} className="bg-white text-blue-900 font-bold px-3 py-1 rounded-xl border border-blue-200 text-xs font-mono shadow-xs">
                        {code} - {selectedOrder.subjectNamesBn ? selectedOrder.subjectNamesBn[idx] : `বিষয় কোড ${code}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Readymade Teletalk SMS Commands Generator */}
              <div className="bg-slate-900/95 backdrop-blur-2xl text-white p-6 sm:p-8 rounded-[32px] border border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span>টেলিটক সিম রেডিমেড SMS কমান্ড জেনারেটর</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">16222 SMS</span>
                </div>

                {/* Step 1 Command */}
                <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-bold">১ম এসএমএস কমান্ড (TeleTalk 1st Command):</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Send to 16222</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generateFirstSmsCommand(selectedOrder.board, selectedOrder.roll, selectedOrder.subjects)}
                      className="w-full bg-slate-950 text-emerald-400 border border-slate-700 rounded-xl p-3 font-mono font-bold text-sm"
                    />
                    <button
                      onClick={() => copyText(generateFirstSmsCommand(selectedOrder.board, selectedOrder.roll, selectedOrder.subjects), 'cmd1')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                    >
                      {copiedCmd === 'cmd1' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCmd === 'cmd1' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                    </button>
                  </div>
                </div>

                {/* Board Reply 1 Storage Input */}
                <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <label className="text-xs text-slate-300 font-bold block">
                    শিক্ষা বোর্ড / টেলিটক থেকে ১ম কমান্ডের পর প্রাপ্ত ফিরতি SMS বা রিপ্লাই দিন:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="যেমন: You have requested for DHA Roll 142850 Sub 101,107. Total Tk 350 will be charged. PIN 84920153."
                    value={boardReply1Input}
                    onChange={e => setBoardReply1Input(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl p-3 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        handleUpdateOrderStatus(
                          selectedOrder.id,
                          selectedOrder.orderStatus,
                          inputPin,
                          adminNoteInput || selectedOrder.adminNotes,
                          selectedOrder.paymentStatus,
                          boardReply1Input
                        );
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>বোর্ড রিপ্লাই মেসেজ সেভ করুন</span>
                    </button>
                  </div>
                </div>

                {/* PIN Input */}
                <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <label className="text-xs text-slate-300 font-bold block">
                    টেলিটক ফেরত পিন নম্বর প্রদান করুন (1st SMS-এ প্রাপ্ত PIN):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="যেমন: 84920153"
                      value={inputPin}
                      onChange={e => setInputPin(e.target.value)}
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl p-3 font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => {
                        requestStatusChangeWithConfirmation(
                          selectedOrder.id,
                          'SMS Sent',
                          'Paid',
                          inputPin,
                          boardReply1Input,
                          adminNoteInput || '১ম এসএমএস পাঠানো সম্পন্ন। পিন সেভ করা হয়েছে।'
                        );
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-xl text-xs shrink-0 transition cursor-pointer"
                    >
                      পিন সেভ করুন
                    </button>
                  </div>
                </div>

                {/* Step 2 Command */}
                {inputPin && (
                  <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-bold">২য় এসএমএস কনফার্মেশন কমান্ড (TeleTalk 2nd Command):</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Send to 16222</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generateSecondSmsCommand(inputPin, selectedOrder.phone)}
                        className="w-full bg-slate-950 text-emerald-400 border border-slate-700 rounded-xl p-3 font-mono font-bold text-sm"
                      />
                      <button
                        onClick={() => copyText(generateSecondSmsCommand(inputPin, selectedOrder.phone), 'cmd2')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                      >
                        {copiedCmd === 'cmd2' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCmd === 'cmd2' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Right Column: Status Manager & WhatsApp Step-by-Step API Triggers */}
            <div className="space-y-6">
              
              {/* Payment Status & Custom Admin Note Update Card */}
              <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[32px] border border-white/80 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-200/80 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>স্ট্যাটাস ও নোটিফিকেশন মেসেজ আপডেট</span>
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    লাইভ কাস্টমার স্ট্যাটাস নোট (Customer Visible Status):
                  </label>
                  <textarea
                    rows={3}
                    value={adminNoteInput || selectedOrder.adminNotes || ''}
                    onChange={e => setAdminNoteInput(e.target.value)}
                    placeholder="যেমন: Written Processing by Abedoni"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-bn focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Dropdown Selector */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="text-xs sm:text-sm font-extrabold text-slate-800 block">
                    আবেদনের স্ট্যাটাস পরিবর্তন করুন (পপআপ কনফার্মেশন সহ):
                  </label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={e => {
                      const newStat = e.target.value as OrderStatus;
                      requestStatusChangeWithConfirmation(
                        selectedOrder.id,
                        newStat,
                        newStat === 'Pending' ? 'Reviewing' : 'Paid',
                        inputPin,
                        boardReply1Input,
                        adminNoteInput || `স্ট্যাটাস পরিবর্তন: ${newStat}`
                      );
                    }}
                    className="w-full bg-white border-2 border-blue-600 text-slate-900 font-extrabold p-3 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                  >
                    <option value="Pending">1. Pending (যাচাইাধীন / Reviewing)</option>
                    <option value="Payment Verified">2. Payment Verified (পেমেন্ট কনফার্মড)</option>
                    <option value="Processing">3. Processing (Processing by Abedoni)</option>
                    <option value="SMS Sent">4. SMS Sent (১ম টেলিটক এসএমএস প্রেরিত)</option>
                    <option value="Completed">5. Completed (আবেদন ১০০% সফলভাবে সম্পন্ন)</option>
                    <option value="Cancelled">6. Cancelled (বাতিল / পেমেন্ট ইস্যু)</option>
                  </select>
                </div>

                {/* Quick Status Action Buttons */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-600 block">কুইক অ্যাকশন বাটন:</span>
                  
                  <button
                    onClick={() => {
                      requestStatusChangeWithConfirmation(
                        selectedOrder.id,
                        'Processing',
                        'Paid',
                        inputPin,
                        boardReply1Input,
                        'Written Processing by Abedoni'
                      );
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-between transition cursor-pointer shadow-sm"
                  >
                    <span>🟢 Confirm Payment & Processing</span>
                    <span className="font-mono text-[10px]">Processing</span>
                  </button>

                  <button
                    onClick={() => {
                      requestStatusChangeWithConfirmation(
                        selectedOrder.id,
                        'SMS Sent',
                        'Paid',
                        inputPin,
                        boardReply1Input,
                        '১ম এসএমএস পাঠানো সম্পন্ন। পিন কনফার্মেশন প্রসেস হচ্ছে।'
                      );
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-between transition cursor-pointer shadow-sm"
                  >
                    <span>📩 Mark 1st TeleTalk SMS Sent</span>
                    <span className="font-mono text-[10px]">SMS Sent</span>
                  </button>

                  <button
                    onClick={() => {
                      requestStatusChangeWithConfirmation(
                        selectedOrder.id,
                        'Completed',
                        'Paid',
                        inputPin,
                        boardReply1Input,
                        'আবেদন ১০০% সফলভাবে শিক্ষা বোর্ডে জমা হয়েছে। রসিদ ডাউনলোডে প্রস্তুত।'
                      );
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-between transition cursor-pointer shadow-sm"
                  >
                    <span>✅ Mark Fully Completed</span>
                    <span className="font-mono text-[10px]">Completed</span>
                  </button>

                  <button
                    onClick={() => {
                      requestStatusChangeWithConfirmation(
                        selectedOrder.id,
                        'Cancelled',
                        'Unverified',
                        inputPin,
                        boardReply1Input,
                        'পেমেন্ট তথ্য পুনঃযাচাই করা প্রয়োজন।'
                      );
                    }}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-between transition cursor-pointer shadow-sm"
                  >
                    <span>❌ Cancel / Re-verify Payment</span>
                    <span className="font-mono text-[10px]">Cancelled</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp 1-Click OneClick Direct Message API Triggers */}
              <div className="bg-emerald-950 text-emerald-100 p-6 rounded-[32px] border border-emerald-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <span>WhatsApp 1-Click অটো মেসেজিং</span>
                  </h3>
                  <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-bold">API</span>
                </div>

                <p className="text-xs text-emerald-300 leading-relaxed">
                  প্রতিটি ধাপে শিক্ষার্থীকে এক ক্লিকে সরাসরি হোয়াটসঅ্যাপে বার্তা প্রেরণ করতে পারবেন:
                </p>

                <div className="space-y-2">
                  <a
                    href={getStepWhatsappUrl(selectedOrder, 'received')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-between transition shadow-sm"
                  >
                    <span>১. পেমেন্ট নিশ্চিতকরণ বার্তা</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={getStepWhatsappUrl(selectedOrder, 'processing')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-between transition shadow-sm"
                  >
                    <span>২. Processing by Abedoni বার্তা</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={getStepWhatsappUrl(selectedOrder, 'pin')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-between transition shadow-sm"
                  >
                    <span>৩. ১ম এসএমএস সফল & পিন বার্তা</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={getStepWhatsappUrl(selectedOrder, 'completed')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-between transition shadow-sm"
                  >
                    <span>৪. ১০০% আবেদন সফল বার্তা</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={getStepWhatsappUrl(selectedOrder, 'issue')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-between transition shadow-sm"
                  >
                    <span>৫. পেমেন্ট অসঙ্গতি / পুনঃযাচাই বার্তা</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : activeTab === 'orders' ? (
        /* ------------------------------------------------------------- */
        /* 2. ORDERS LIST TABLE VIEW */
        /* ------------------------------------------------------------- */
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-md space-y-1">
              <span className="text-xs text-slate-500 font-bold">মোট আবেদন</span>
              <p className="text-2xl font-black text-slate-900 font-mono">{totalOrdersCount}</p>
            </div>
            <div className="bg-amber-50/80 p-5 rounded-3xl border border-amber-200 shadow-md space-y-1">
              <span className="text-xs text-amber-800 font-bold">পেন্ডিং আবেদন</span>
              <p className="text-2xl font-black text-amber-900 font-mono">{pendingCount}</p>
            </div>
            <div className="bg-blue-50/80 p-5 rounded-3xl border border-blue-200 shadow-md space-y-1">
              <span className="text-xs text-blue-800 font-bold">Processing by Abedoni</span>
              <p className="text-2xl font-black text-blue-900 font-mono">{processingCount}</p>
            </div>
            <div className="bg-emerald-50/80 p-5 rounded-3xl border border-emerald-200 shadow-md space-y-1">
              <span className="text-xs text-emerald-800 font-bold">সম্পন্ন (Completed)</span>
              <p className="text-2xl font-black text-emerald-900 font-mono">{completedCount}</p>
            </div>
            <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-1 col-span-2 lg:col-span-1 shadow-lg">
              <span className="text-xs text-slate-400 font-bold">মোট সংগৃহীত ফি</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">৳{totalRevenueBDT}</p>
            </div>
          </div>

          {/* Filters & Export Bar */}
          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-3xl border border-white/80 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Order ID / Roll / Phone / Name / TrxID দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 text-xs rounded-2xl p-2.5 font-bold shadow-xs cursor-pointer"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={boardFilter}
                onChange={e => setBoardFilter(e.target.value)}
                className="bg-white border border-slate-300 text-xs rounded-2xl p-2.5 font-bold shadow-xs cursor-pointer"
              >
                <option value="ALL">সকল বোর্ড</option>
                {BOARDS_LIST.map(b => (
                  <option key={b.code} value={b.code}>{b.codeSms} - {b.nameEn}</option>
                ))}
              </select>

              <a
                href="/api/export/csv"
                download
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>CSV রিপোর্ট</span>
              </a>
            </div>
          </div>

          {/* Orders Management Table */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-800 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">Order ID / তারিখ</th>
                    <th className="p-3.5">শিক্ষার্থীর নাম</th>
                    <th className="p-3.5">রোল ও বোর্ড</th>
                    <th className="p-3.5">বিষয়সমূহ</th>
                    <th className="p-3.5">পেমেন্ট ও TrxID</th>
                    <th className="p-3.5">পেমেন্ট স্ট্যাটাস</th>
                    <th className="p-3.5 text-right">অ্যাকশন & সিঙ্গেল পেজ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                        কোনো আবেদন পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    orders.map(ord => (
                      <tr 
                        key={ord.id} 
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setInputPin(ord.teletalkPin || '');
                          setAdminNoteInput(ord.adminNotes || '');
                        }}
                      >
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-blue-700 group-hover:underline block text-xs">{ord.id}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ord.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block">{ord.studentName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{ord.phone}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                            {ord.roll}
                          </span>
                          <span className="text-blue-700 font-bold block text-[10px] mt-0.5">
                            {ord.board} (Reg: {ord.reg})
                          </span>
                        </td>
                        <td className="p-3.5 max-w-[150px]">
                          <span className="font-mono font-semibold text-slate-700 block truncate">
                            {ord.subjects.join(', ')}
                          </span>
                          <span className="text-[10px] text-slate-500">({ord.subjects.length} বিষয়)</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-emerald-700 block font-mono">৳{ord.totalFee}</span>
                          <span className="font-mono text-[10px] text-slate-500">{ord.trxId} ({ord.paymentMethod})</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-amber-100 text-amber-900 border-amber-300 inline-block">
                            {ord.adminNotes || 'Written Processing by Abedoni'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setInputPin(ord.teletalkPin || '');
                              setAdminNoteInput(ord.adminNotes || '');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                          >
                            <span>ম্যানেজ & ডিটেইলস পেজ</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ------------------------------------------------------------- */
        /* 3. WORDPRESS-LIKE FULL CUSTOMIZABLE SYSTEM SETTINGS PANEL */
        /* ------------------------------------------------------------- */
        <form onSubmit={handleSaveSettings} className="bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/80 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>ওয়ার্ডপ্রেস-স্টাইল ফুল কন্ট্রোল অ্যান্ড কাস্টমাইজেশন</span>
              </h2>
              <p className="text-slate-500 text-xs">হেডার টেক্সট, ফি, কন্টাক্ট, পলিসি ডকুমেন্টস এবং সিস্টেম টোগল কাস্টমাইজ করুন</p>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              <span>সেটিংস সেভ করুন</span>
            </button>
          </div>

          {settingsSavedMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{settingsSavedMessage}</span>
            </div>
          )}

          {/* WordPress Sub-Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSettingsSubTab('branding')}
              className={`px-4 py-2 rounded-xl transition ${
                settingsSubTab === 'branding' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🎨 ব্র্যান্ডিং ও কন্টেন্ট (Branding & Titles)
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('payments')}
              className={`px-4 py-2 rounded-xl transition ${
                settingsSubTab === 'payments' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              💳 পেমেন্ট ও ফি সেটআপ (Payments & Fees)
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('support')}
              className={`px-4 py-2 rounded-xl transition ${
                settingsSubTab === 'support' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📞 হেল্পডেস্ক ও কন্টাক্ট (Support Info)
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('policies')}
              className={`px-4 py-2 rounded-xl transition ${
                settingsSubTab === 'policies' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📜 পলিসি ডকুমেন্টস এডিটর (Policies Editor)
            </button>
          </div>

          {/* SUBTAB 1: BRANDING & TITLES */}
          {settingsSubTab === 'branding' && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs sm:text-sm animate-in fade-in">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                সাইট হেডলাইন ও নোটিশ ব্যানার কাস্টমাইজেশন
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">সাইট নেম / টাইটেল</label>
                  <input
                    type="text"
                    value={appSettings.siteName}
                    onChange={e => setAppSettings({ ...appSettings, siteName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">টপ নোটিশ বার টেক্সট (Top Banner Text)</label>
                  <input
                    type="text"
                    value={appSettings.noticeBannerText}
                    onChange={e => setAppSettings({ ...appSettings, noticeBannerText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">ল্যান্ডিং পেজ মেইন হেডলাইন (Hero Headline)</label>
                <input
                  type="text"
                  value={appSettings.heroHeadline}
                  onChange={e => setAppSettings({ ...appSettings, heroHeadline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">ল্যান্ডিং পেজ সাব-হেডলাইন (Hero Subtitle)</label>
                <textarea
                  rows={2}
                  value={appSettings.heroSubheadline}
                  onChange={e => setAppSettings({ ...appSettings, heroSubheadline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Logo Icon SVG URL</label>
                  <input
                    type="text"
                    value={appSettings.logoIconUrl}
                    onChange={e => setAppSettings({ ...appSettings, logoIconUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Logo Wordmark Image URL</label>
                  <input
                    type="text"
                    value={appSettings.logoWordmarkUrl}
                    onChange={e => setAppSettings({ ...appSettings, logoWordmarkUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: PAYMENTS & FEES */}
          {settingsSubTab === 'payments' && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs sm:text-sm animate-in fade-in">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                পেমেন্ট নম্বর ও ফি সেটিংস
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">bKash Personal Number</label>
                  <input
                    type="text"
                    value={appSettings.bkashNumber}
                    onChange={e => setAppSettings({ ...appSettings, bkashNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nagad Personal Number</label>
                  <input
                    type="text"
                    value={appSettings.nagadNumber}
                    onChange={e => setAppSettings({ ...appSettings, nagadNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Rocket Personal Number</label>
                  <input
                    type="text"
                    value={appSettings.rocketNumber}
                    onChange={e => setAppSettings({ ...appSettings, rocketNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">অফিশিয়াল বোর্ড ফি (Per Subject BDT)</label>
                  <input
                    type="number"
                    value={appSettings.officialBoardFee}
                    onChange={e => setAppSettings({ ...appSettings, officialBoardFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">SMS ফি (Fixed 6 BDT Per Order)</label>
                  <input
                    type="number"
                    value={appSettings.smsFeePerSubject || 6}
                    onChange={e => setAppSettings({ ...appSettings, smsFeePerSubject: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">আবেদনী সার্ভিস চার্জ (Per Order BDT)</label>
                  <input
                    type="number"
                    value={appSettings.abedoniServiceFee}
                    onChange={e => setAppSettings({ ...appSettings, abedoniServiceFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: SUPPORT INFO */}
          {settingsSubTab === 'support' && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs sm:text-sm animate-in fade-in">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                কাস্টমার সাপোর্ট ও হেল্পডেস্ক তথ্য
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">WhatsApp Support Phone</label>
                  <input
                    type="text"
                    value={appSettings.whatsappNumber}
                    onChange={e => setAppSettings({ ...appSettings, whatsappNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Official Support Email</label>
                  <input
                    type="email"
                    value={appSettings.officialEmail}
                    onChange={e => setAppSettings({ ...appSettings, officialEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Support Hours (সময়সূচি)</label>
                  <input
                    type="text"
                    value={appSettings.supportHours}
                    onChange={e => setAppSettings({ ...appSettings, supportHours: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4: POLICIES EDITOR */}
          {settingsSubTab === 'policies' && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs sm:text-sm animate-in fade-in">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                গোপনীয়তা নীতি ও শর্তাবলী কাস্টমাইজেশন
              </h3>

              <div>
                <label className="block font-bold text-slate-800 mb-1">গোপনীয়তা নীতি (Privacy Policy Custom Text)</label>
                <textarea
                  rows={3}
                  value={appSettings.privacyPolicyText || ''}
                  onChange={e => setAppSettings({ ...appSettings, privacyPolicyText: e.target.value })}
                  placeholder="আবেদনীতে শিক্ষার্থীদের তথ্য শতভাগ সুরক্ষিত রাখা হয়..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">ব্যবহারের শর্তাবলী (Terms of Service Custom Text)</label>
                <textarea
                  rows={3}
                  value={appSettings.termsText || ''}
                  onChange={e => setAppSettings({ ...appSettings, termsText: e.target.value })}
                  placeholder="বোর্ড ফি ও নির্দিষ্ট সার্ভিস ফি দিয়ে আবেদন সম্পন্ন করতে হবে..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              <span>পরিবর্তনসমূহ সেভ করুন</span>
            </button>
          </div>

        </form>
      )}

      {/* STATUS CHANGE CONFIRMATION POPUP MODAL */}
      {confirmModalData?.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 font-bn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-amber-600 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">স্ট্যাটাস পরিবর্তনের সতর্কতা</h3>
                <p className="text-xs text-slate-500 font-bold">ভুল এড়িয়ে সতর্কতার সাথে কনফার্ম করুন</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <p className="leading-relaxed">
                আপনি কি নিশ্চিত যে আবেদন ID: <strong className="font-mono text-blue-700 font-black">{confirmModalData.orderId}</strong> এর বর্তমান স্ট্যাটাস পরিবর্তন করে <strong className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-black">{confirmModalData.targetStatus}</strong> এ আপডেট করতে চান?
              </p>
              {confirmModalData.note && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-xs">
                  <span className="text-slate-400 block text-[10px]">স্ট্যাটাস নোট:</span>
                  <span className="text-slate-800 font-bold">{confirmModalData.note}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateOrderStatus(
                    confirmModalData.orderId,
                    confirmModalData.targetStatus,
                    confirmModalData.pin,
                    confirmModalData.note,
                    confirmModalData.targetPaymentStatus,
                    confirmModalData.boardReply1
                  );
                }}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isUpdating ? 'আপডেট হচ্ছে...' : 'হ্যাঁ, নিশ্চিত পরিবর্তন করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
