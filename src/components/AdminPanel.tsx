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
  LogOut,
  Trash2,
  UserCheck,
  TrendingUp,
  UserPlus,
  Edit,
  X
} from 'lucide-react';
import { BoardChallengeOrder, OrderStatus, EducationBoard } from '../types';
import { BOARDS_LIST, generateFirstSmsCommand, generateSecondSmsCommand, replaceTemplateVars } from '../data/boardsAndSubjects';
import { getAppSettings, saveAppSettings, AppSettings, ModeratorUser } from '../data/appSettings';

interface AdminPanelProps {
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [settingsSubTab, setSettingsSubTab] = useState<'branding' | 'payments' | 'support' | 'policies' | 'whatsapp' | 'system' | 'moderators'>('branding');
  
  const [orders, setOrders] = useState<BoardChallengeOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [boardFilter, setBoardFilter] = useState<string>('ALL');
  
  // User Role
  const [adminRole] = useState<string>(() => {
    return sessionStorage.getItem('abedoni_admin_role') || 'admin';
  });

  // 10-Minute Inactivity Security Timeout
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [inactivityMinutesLeft, setInactivityMinutesLeft] = useState<number>(10);

  useEffect(() => {
    const handleUserActivity = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const timer = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const remainingSeconds = Math.max(0, Math.ceil((10 * 60 * 1000 - elapsed) / 1000));
      setInactivityMinutesLeft(Math.ceil(remainingSeconds / 60));

      if (elapsed >= 10 * 60 * 1000) {
        sessionStorage.removeItem('abedoni_admin_authed');
        sessionStorage.removeItem('abedoni_admin_role');
        if (onLogout) {
          onLogout();
        } else {
          window.location.reload();
        }
      }
    }, 5000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(timer);
    };
  }, [lastActivity, onLogout]);

  // Delete Order Confirmation Popup Modal State
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<BoardChallengeOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // App Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(getAppSettings());
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string>('');

  // Moderator User Form State
  const [newModUsername, setNewModUsername] = useState('');
  const [newModPin, setNewModPin] = useState('');
  const [newModName, setNewModName] = useState('');
  const [newModRole, setNewModRole] = useState<'moderator' | 'operator' | 'support'>('moderator');

  // Single Dedicated Order Page State
  const [selectedOrder, setSelectedOrder] = useState<BoardChallengeOrder | null>(null);
  const [inputPin, setInputPin] = useState<string>('');
  const [boardReply1Input, setBoardReply1Input] = useState<string>('');
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Auto-Extract Teletalk PIN from SMS
  const extractPinFromSms = (text: string): string | null => {
    if (!text) return null;
    const pinMatch = text.match(/(?:PIN|Pin|pin)\s*[:=.-]?\s*([0-9]{5,12})/i);
    if (pinMatch && pinMatch[1]) {
      return pinMatch[1];
    }
    const numberMatch = text.match(/\b([0-9]{6,10})\b/);
    if (numberMatch && numberMatch[1]) {
      return numberMatch[1];
    }
    return null;
  };

  const handleBoardReply1Change = (text: string) => {
    setBoardReply1Input(text);
    const pin = extractPinFromSms(text);
    if (pin) {
      setInputPin(pin);
    }
  };

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

  // Edit Student Order Info State
  const [editingOrder, setEditingOrder] = useState<BoardChallengeOrder | null>(null);
  const [editForm, setEditForm] = useState<{
    studentName: string;
    roll: string;
    reg: string;
    board: EducationBoard;
    phone: string;
    whatsapp: string;
    fatherName: string;
    motherName: string;
    trxId: string;
    paymentSenderPhone: string;
    paymentMethod: string;
    totalFee: number;
    subjects: string;
  }>({
    studentName: '',
    roll: '',
    reg: '',
    board: 'DHA',
    phone: '',
    whatsapp: '',
    fatherName: '',
    motherName: '',
    trxId: '',
    paymentSenderPhone: '',
    paymentMethod: 'bKash',
    totalFee: 0,
    subjects: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  const openEditModal = (order: BoardChallengeOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrder(order);
    setEditForm({
      studentName: order.studentName || '',
      roll: order.roll || '',
      reg: order.reg || '',
      board: order.board || 'DHA',
      phone: order.phone || '',
      whatsapp: order.whatsapp || order.phone || '',
      fatherName: order.fatherName || '',
      motherName: order.motherName || '',
      trxId: order.trxId || '',
      paymentSenderPhone: order.paymentSenderPhone || order.phone || '',
      paymentMethod: order.paymentMethod || 'bKash',
      totalFee: order.totalFee || 0,
      subjects: (order.subjects || []).join(', '),
    });
  };

  const handleSaveEditedOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsSavingEdit(true);

    const parsedSubjects = editForm.subjects
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: editForm.studentName,
          roll: editForm.roll,
          reg: editForm.reg,
          board: editForm.board,
          phone: editForm.phone,
          whatsapp: editForm.whatsapp,
          fatherName: editForm.fatherName,
          motherName: editForm.motherName,
          trxId: editForm.trxId,
          paymentSenderPhone: editForm.paymentSenderPhone,
          paymentMethod: editForm.paymentMethod,
          totalFee: editForm.totalFee,
          subjects: parsedSubjects,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.map(o => o.id === editingOrder.id ? data.order : o));
        if (selectedOrder?.id === editingOrder.id) {
          setSelectedOrder(data.order);
        }
        setEditingOrder(null);
      } else {
        alert('তথ্য আপডেট করতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      alert('নেটওয়ার্ক এরর! আবার চেষ্টা করুন।');
    } finally {
      setIsSavingEdit(false);
    }
  };

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

  const triggerDeleteOrder = (order: BoardChallengeOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirmOrder(order);
  };

  const confirmAndDeleteOrder = async () => {
    if (!deleteConfirmOrder) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/orders/${deleteConfirmOrder.id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== deleteConfirmOrder.id));
        if (selectedOrder?.id === deleteConfirmOrder.id) {
          setSelectedOrder(null);
        }
        setDeleteConfirmOrder(null);
      } else {
        alert('আবেদনটি মুছে ফেলতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      alert('নেটওয়ার্ক এরর! আবার চেষ্টা করুন।');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics Calculations
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter(o => o.orderStatus === 'Pending').length;
  const processingCount = orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Payment Verified').length;
  const completedCount = orders.filter(o => o.orderStatus === 'Completed').length;
  const totalRevenueBDT = orders.reduce((sum, o) => sum + (o.totalFee || 0), 0);

  // Daily Income Report WITHOUT Board Fee (Pure Platform/Service Fee Revenue)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(todayDateStr));
  const dailyNetIncomeBDT = todayOrders.reduce((sum, o) => sum + (o.platformFee || 99), 0);
  const totalNetIncomeBDT = orders.reduce((sum, o) => sum + (o.platformFee || 99), 0);

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

    const vars = {
      studentName: order.studentName,
      orderId: order.id,
      rollNumber: order.roll,
      regNumber: order.reg || 'N/A',
      boardName: order.board,
      totalFee: order.totalFee,
      trxId: order.trxId,
      paymentMethod: order.paymentMethod,
      teletalkPin: order.teletalkPin || inputPin || 'N/A',
      siteUrl: siteUrl,
      subjects: order.subjectNamesBn ? order.subjectNamesBn.join(', ') : order.subjects.join(', '),
    };

    let template = '';
    if (step === 'received') {
      template = appSettings.whatsappTemplateReceived || `প্রিয় {studentName}, আবেদনী (Abedoni)-তে আপনার {boardName} বোর্ডের SSC বোর্ড চ্যালেঞ্জ ফি (৳{totalFee}) সফলভাবে প্রাপ্ত হয়েছে। Order ID: {orderId}। ট্র্যাকিং লিংক: {siteUrl}`;
    } else if (step === 'processing') {
      template = appSettings.whatsappTemplateProcessing || `প্রিয় {studentName}, আপনার বোর্ড চ্যালেঞ্জ আবেদনটি (ID: {orderId}, Roll: {rollNumber}) সফলভাবে প্রসেসিংয়ে রয়েছে (Written Processing by Abedoni)। কোনো চিন্তা নেই, খুব দ্রুতই টেলিটকে জমা দেওয়া হবে।`;
    } else if (step === 'pin') {
      template = appSettings.whatsappTemplatePin || `প্রিয় {studentName}, আপনার আবেদনী আবেদনের ১ম ধাপ টেলিটক সার্ভারে সাবমিট করা হয়েছে। TeleTalk PIN: {teletalkPin}। ২য় কনফার্মেশন চূড়ান্ত করা হচ্ছে।`;
    } else if (step === 'completed') {
      template = appSettings.whatsappTemplateCompleted || `অভিনন্দন {studentName}! আপনার SSC বোর্ড চ্যালেঞ্জ আবেদনটি সফলভাবে শিক্ষা বোর্ডে জমা হয়েছে। Order ID: {orderId}। আপনার অনলাইন ডিজিটাল ট্র্যাকিং রসিদ দেখতে ভিজিট করুন: {siteUrl}`;
    } else if (step === 'issue') {
      template = appSettings.whatsappTemplateIssue || `প্রিয় {studentName}, আপনার আবেদনের প্রদানকৃত TrxID ({trxId}) বা পেমেন্ট তথ্যে অসঙ্গতি পাওয়া গেছে। অনুগ্রহ করে সঠিক তথ্যের স্ক্রিনশট পাঠিয়ে আমাদের সাথে যোগাযোগ করুন। Order ID: {orderId}`;
    }

    const formattedText = replaceTemplateVars(template, vars);
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(formattedText)}`;
  };

  return (
    <div className="space-y-8 pb-20 font-bn max-w-7xl mx-auto">
      
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 mb-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {adminRole === 'moderator' ? 'মডারেটর কন্ট্রোল প্যানেল' : 'আবেদনী অ্যাডমিন কন্ট্রোল প্যানেল'}
            </h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
              adminRole === 'moderator' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-white'
            }`}>
              {adminRole === 'moderator' ? 'MODERATOR' : 'ADMIN V2.8'}
            </span>

            {/* Inactivity Auto-Logout Badge */}
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>নিষ্ক্রিয়তা নিরাপত্তা: ১০ মি. ({inactivityMinutesLeft} মি.)</span>
            </span>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            SSC Board Challenge 2026 পেমেন্ট ভেরিফিকেশন, টেলিটক অটো-কমান্ড, ওয়াটসঅ্যাপ API এবং মডারেটর ইউজার ম্যানেজমেন্ট
          </p>
        </div>

        {/* Tab Switcher & Logout */}
        <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'orders' && !selectedOrder ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>অর্ডার তালিকা ({totalOrdersCount})</span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); setSelectedOrder(null); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'settings' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>অ্যাপ সেটিংস কাস্টমাইজার</span>
          </button>

          <button
            onClick={() => {
              sessionStorage.removeItem('abedoni_admin_authed');
              sessionStorage.removeItem('abedoni_admin_role');
              if (onLogout) {
                onLogout();
              } else {
                window.location.href = '/';
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 ml-auto"
            title="Exit Admin Panel & Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
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

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Order ID:</span>
              <span className="text-sm font-black text-blue-700 font-mono bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                {selectedOrder.id}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full border bg-amber-100 text-amber-900 border-amber-300">
                {selectedOrder.adminNotes || 'Written Processing by Abedoni'}
              </span>

              {adminRole !== 'moderator' && (
                <button
                  onClick={(e) => triggerDeleteOrder(selectedOrder, e)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer ml-2"
                  title="Delete Order"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>আবেদন ডিলিট</span>
                </button>
              )}
            </div>
          </div>

          {/* Main 2-Column Single Order Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Student Profile & SMS Command Generators */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Student Application Summary */}
              <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[32px] border border-white/80 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>শিক্ষার্থী ও আবেদনের বিবরণ</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => openEditModal(selectedOrder, e)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>তথ্য এডিট করুন</span>
                    </button>
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                      তারিখ: {new Date(selectedOrder.createdAt).toLocaleString('bn-BD')}
                    </span>
                  </div>
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
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="text-xs text-slate-300 font-bold block">
                      শিক্ষা বোর্ড / টেলিটক থেকে ১ম কমান্ডের পর প্রাপ্ত ফিরতি SMS বা রিপ্লাই দিন:
                    </label>
                    {extractPinFromSms(boardReply1Input) && (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded-lg border border-emerald-700/80 flex items-center gap-1 animate-in fade-in">
                        <span>✨ অটো-ডিটেক্ট করা পিন:</span>
                        <strong className="font-mono text-white text-xs">{extractPinFromSms(boardReply1Input)}</strong>
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="যেমন: You have requested for DHA Roll 142850 Sub 101,107. Total Tk 350 will be charged. PIN 84920153."
                    value={boardReply1Input}
                    onChange={e => handleBoardReply1Change(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl p-3 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-slate-400">
                      💡 টিপস: টেলিটক থেকে প্রাপ্ত ফিরতি SMS পেস্ট করলেই পিন অটো-ডিটেক্ট হয়ে নিচে বসে যাবে!
                    </p>
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
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>বোর্ড রিপ্লাই মেসেজ সেভ করুন</span>
                    </button>
                  </div>
                </div>

                {/* PIN Input & Save to Confirm */}
                <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-300 font-bold block">
                      টেলিটক ফেরত পিন নম্বর (1st SMS-এ প্রাপ্ত PIN):
                    </label>
                    {inputPin && (
                      <span className="text-[11px] text-blue-400 font-mono font-bold">
                        PIN: {inputPin}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      placeholder="যেমন: 84920153"
                      value={inputPin}
                      onChange={e => setInputPin(e.target.value)}
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl p-3 font-mono font-extrabold text-base focus:ring-2 focus:ring-emerald-500"
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
                      className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-3 rounded-xl text-xs shrink-0 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-200" />
                      <span>Pin Save to Confirm</span>
                    </button>
                  </div>
                </div>

                {/* Step 2 Command */}
                {inputPin && (
                  <div className="space-y-2 bg-emerald-950/70 p-4 rounded-2xl border border-emerald-700/80 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>২য় এসএমএস কনফার্মেশন কমান্ড (TeleTalk 2nd Command):</span>
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-900 px-2 py-0.5 rounded">Send to 16222</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generateSecondSmsCommand(inputPin, selectedOrder.phone)}
                        className="w-full bg-slate-950 text-emerald-300 border border-emerald-700 rounded-xl p-3 font-mono font-black text-base tracking-wide"
                      />
                      <button
                        onClick={() => copyText(generateSecondSmsCommand(inputPin, selectedOrder.phone), 'cmd2')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer shadow-md"
                      >
                        {copiedCmd === 'cmd2' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCmd === 'cmd2' ? 'কপি হয়েছে' : '২য় কমান্ড কপি করুন'}</span>
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
          {/* Metrics Row & Daily Income Report Without Board Fee */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white/70 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/80 shadow-md space-y-1">
              <span className="text-xs text-slate-500 font-bold">মোট আবেদন</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{totalOrdersCount}</p>
            </div>
            <div className="bg-amber-50/80 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-200 shadow-md space-y-1">
              <span className="text-xs text-amber-800 font-bold">পেন্ডিং আবেদন</span>
              <p className="text-xl sm:text-2xl font-black text-amber-900 font-mono">{pendingCount}</p>
            </div>
            <div className="bg-blue-50/80 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-blue-200 shadow-md space-y-1">
              <span className="text-xs text-blue-800 font-bold">Processing by Abedoni</span>
              <p className="text-xl sm:text-2xl font-black text-blue-900 font-mono">{processingCount}</p>
            </div>
            <div className="bg-emerald-50/80 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-emerald-200 shadow-md space-y-1">
              <span className="text-xs text-emerald-800 font-bold">সম্পন্ন (Completed)</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">{completedCount}</p>
            </div>

            {/* Daily Net Profit Report Card (Without Board Fee) */}
            <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1 col-span-2 sm:col-span-2 shadow-xl border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-black flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>দৈনিক নিট ইনকাম (বোর্ড ফি ব্যতীত)</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  আজকের লাভ
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-xl sm:text-3xl font-black text-emerald-400 font-mono">৳{dailyNetIncomeBDT} BDT</p>
                  <p className="text-[10px] text-slate-300">আজকে মোট {todayOrders.length}টি আবেদনের সার্ভিস চার্জ</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">সর্বমোট প্ল্যাটফর্ম ফি</span>
                  <span className="text-sm font-black text-teal-300 font-mono">৳{totalNetIncomeBDT} BDT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Export Bar */}
          <div className="bg-white/70 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/80 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
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

            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 text-xs rounded-2xl p-2.5 font-bold shadow-xs cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={boardFilter}
                onChange={e => setBoardFilter(e.target.value)}
                className="bg-white border border-slate-300 text-xs rounded-2xl p-2.5 font-bold shadow-xs cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">সকল বোর্ড</option>
                {BOARDS_LIST.map(b => (
                  <option key={b.code} value={b.code}>{b.codeSms} - {b.nameEn}</option>
                ))}
              </select>

              <a
                href="/api/export/csv"
                download
                className="col-span-2 sm:col-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>CSV রিপোর্ট</span>
              </a>
            </div>
          </div>

          {/* Mobile Orders Card List (visible on mobile < md) */}
          <div className="block md:hidden space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl text-center text-slate-500 font-bold border border-slate-200">
                কোনো আবেদন পাওয়া যায়নি।
              </div>
            ) : (
              orders.map(ord => (
                <div 
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrder(ord);
                    setInputPin(ord.teletalkPin || '');
                    setAdminNoteInput(ord.adminNotes || '');
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-300 active:bg-blue-50/50 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-mono font-black text-blue-700 text-sm">{ord.id}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {new Date(ord.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-100 text-amber-900 border-amber-300">
                      {ord.adminNotes || 'Written Processing by Abedoni'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">শিক্ষার্থীর নাম</span>
                      <span className="font-bold text-slate-900">{ord.studentName}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{ord.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">রোল ও বোর্ড</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">{ord.roll}</span>
                      <span className="text-blue-700 font-bold block text-[10px]">{ord.board} (Reg: {ord.reg})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">বিষয়সমূহ</span>
                      <span className="font-mono text-slate-700 truncate block text-[11px]">{ord.subjects.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">ফি ও TrxID</span>
                      <span className="font-bold text-emerald-700 font-mono">৳{ord.totalFee}</span>
                      <span className="font-mono text-[10px] text-slate-500 block truncate">{ord.trxId} ({ord.paymentMethod})</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(ord);
                        setInputPin(ord.teletalkPin || '');
                        setAdminNoteInput(ord.adminNotes || '');
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>ম্যানেজ & ডিটেইলস →</span>
                    </button>

                    <button
                      onClick={(e) => openEditModal(ord, e)}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shrink-0"
                      title="Edit Student Info"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {adminRole !== 'moderator' && (
                      <button
                        onClick={(e) => triggerDeleteOrder(ord, e)}
                        className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-3 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 border border-rose-300 shrink-0"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Orders Management Table (visible on md and up) */}
          <div className="hidden md:block bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl overflow-hidden">
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
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setInputPin(ord.teletalkPin || '');
                              setAdminNoteInput(ord.adminNotes || '');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                          >
                            <span>ম্যানেজ & ডিটেইলস</span>
                          </button>

                          <button
                            onClick={(e) => openEditModal(ord, e)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                            title="Edit Student Info"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>এডিট</span>
                          </button>

                          {adminRole !== 'moderator' && (
                            <button
                              onClick={(e) => triggerDeleteOrder(ord, e)}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">ডিলিট</span>
                            </button>
                          )}
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
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 my-4 text-xs font-bold overflow-x-auto no-scrollbar w-full">
            <button
              type="button"
              onClick={() => setSettingsSubTab('branding')}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
                settingsSubTab === 'branding' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🎨 ব্র্যান্ডিং ও কন্টেন্ট
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('payments')}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
                settingsSubTab === 'payments' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              💳 পেমেন্ট ও ফি সেটআপ
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('support')}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
                settingsSubTab === 'support' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📞 হেল্পডেস্ক ও কন্টাক্ট
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('policies')}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
                settingsSubTab === 'policies' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📜 পলিসি ডকুমেন্টস
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('whatsapp')}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
                settingsSubTab === 'whatsapp' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              💬 WhatsApp অটো-মেসেজ
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('moderators')}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
                settingsSubTab === 'moderators' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              👥 মডারেটর ইউজারগণ
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

          {/* SUBTAB 5: WHATSAPP 1-CLICK AUTO MESSAGING CONTROLLER */}
          {settingsSubTab === 'whatsapp' && (
            <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs sm:text-sm animate-in fade-in">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span>WhatsApp ১-ক্লিক অটো-মেসেজিং টেমপ্লেট কন্ট্রোলার</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    অ্যাডমিন প্যানেল থেকে কাস্টমারের WhatsApp-এ ১-ক্লিকে পাঠানো যেকোনো মেসেজের ফরম্যাট বা টেক্সট এখানে আপনার পছন্দমতো পরিবর্তন করতে পারবেন।
                  </p>
                </div>
              </div>

              {/* Dynamic Variables Guide Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950">
                <h4 className="font-bold text-xs uppercase tracking-wide text-emerald-800 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>উপলব্ধ ডাইনামিক ফিল্ডসমূহ (Dynamic Placeholders)</span>
                </h4>
                <p className="text-xs text-emerald-800 mb-2">
                  মেসেজের ভেতরে নিচের ট্যাগগুলো লিখলে তা কাস্টমারের আসল তথ্যে রূপান্তরিত হয়ে যাবে:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{studentName}`}</span>
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{orderId}`}</span>
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{rollNumber}`}</span>
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{regNumber}`}</span>
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{boardName}`}</span>
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{totalFee}`}</span>
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{paymentMethod}`}</span>
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{trxId}`}</span>
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{teletalkPin}`}</span>
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{siteUrl}`}</span>
                  <span className="bg-white/80 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-900 font-bold">{`{subjects}`}</span>
                </div>
              </div>

              {/* Template 1: Student Order Submission WhatsApp Text */}
              <div className="space-y-1.5 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                  ১. শিক্ষার্থী অর্ডার নিশ্চিত করার পর আমাদের হেল্পডেস্কে পাঠানোর মেসেজ টেমপ্লেট:
                </label>
                <textarea
                  rows={6}
                  value={appSettings.whatsappTemplateStudentToAdmin || ''}
                  onChange={e => setAppSettings({ ...appSettings, whatsappTemplateStudentToAdmin: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Template 2: Step Received */}
              <div className="space-y-1.5 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                  ২. অর্ডার ফি প্রাপ্তি নিশ্চিতকরণ (Step: Order Received) মেসেজ:
                </label>
                <textarea
                  rows={3}
                  value={appSettings.whatsappTemplateReceived || ''}
                  onChange={e => setAppSettings({ ...appSettings, whatsappTemplateReceived: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Template 3: Step Processing */}
              <div className="space-y-1.5 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                  ৩. ম্যানুয়াল আবেদন প্রসেসিং চলছে (Step: Written Processing) মেসেজ:
                </label>
                <textarea
                  rows={3}
                  value={appSettings.whatsappTemplateProcessing || ''}
                  onChange={e => setAppSettings({ ...appSettings, whatsappTemplateProcessing: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Template 4: Step PIN Received (1st SMS Done) */}
              <div className="space-y-1.5 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                  ৪. ১ম এসএমএস সফল ও পিন বার্তা (Step: 1st SMS Sent / PIN Received) মেসেজ:
                </label>
                <textarea
                  rows={3}
                  value={appSettings.whatsappTemplatePin || ''}
                  onChange={e => setAppSettings({ ...appSettings, whatsappTemplatePin: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Template 5: Step Completed */}
              <div className="space-y-1.5 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                  ৫. আবেদন ১০০% সফল ও রসিদ প্রস্তুত (Step: Application Completed) মেসেজ:
                </label>
                <textarea
                  rows={3}
                  value={appSettings.whatsappTemplateCompleted || ''}
                  onChange={e => setAppSettings({ ...appSettings, whatsappTemplateCompleted: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Template 6: Step Issue / TrxID Mismatch */}
              <div className="space-y-1.5 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                  ৬. পেমেন্ট তথ্যে অসঙ্গতি / সমস্যা (Step: Payment Issue) মেসেজ:
                </label>
                <textarea
                  rows={3}
                  value={appSettings.whatsappTemplateIssue || ''}
                  onChange={e => setAppSettings({ ...appSettings, whatsappTemplateIssue: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* SUBTAB 6: MODERATOR USERS MANAGEMENT */}
          {settingsSubTab === 'moderators' && (
            <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs sm:text-sm animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-600" />
                    <span>ওয়েবসাইট মডারেটর ইউজার ম্যানেজমেন্ট</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    ওয়েবসাইটের অর্ডারের স্ট্যাটাস আপডেট ও প্রসেসিং এর জন্য নতুন মডারেটর এবং টিম মেম্বার যুক্ত বা পরিচালনা করুন।
                  </p>
                </div>
              </div>

              {/* Form to Create New Moderator */}
              <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 space-y-4">
                <h4 className="font-extrabold text-amber-900 text-sm flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-amber-700" />
                  <span>নতুন মডারেটর অ্যাকাউন্ট যুক্ত করুন:</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">ইউজারনেম (Username) *</label>
                    <input
                      type="text"
                      placeholder="যেমন: mod_rahim"
                      value={newModUsername}
                      onChange={e => setNewModUsername(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">পাসওয়ার্ড / পিন (PIN) *</label>
                    <input
                      type="text"
                      placeholder="যেমন: mod123"
                      value={newModPin}
                      onChange={e => setNewModPin(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">পূর্ণ নাম (Full Name)</label>
                    <input
                      type="text"
                      placeholder="যেমন: রহিম হোসেন"
                      value={newModName}
                      onChange={e => setNewModName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">রোল (Access Role)</label>
                    <select
                      value={newModRole}
                      onChange={e => setNewModRole(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="moderator">মডারেটর (Moderator)</option>
                      <option value="operator">অপারেটর (Operator)</option>
                      <option value="support">সাপোর্ট এক্সিকিউটিভ (Support)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!newModUsername.trim() || !newModPin.trim()) {
                        alert('ইউজারনেম এবং পিন/পাসওয়ার্ড আবশ্যক!');
                        return;
                      }
                      const currentMods = appSettings.moderatorUsers || [];
                      if (currentMods.some(m => m.username.toLowerCase() === newModUsername.trim().toLowerCase())) {
                        alert('এই ইউজারনেমটি ইতিপূর্বে ব্যবহৃত হয়েছে!');
                        return;
                      }
                      const newMod: ModeratorUser = {
                        id: 'mod-' + Date.now(),
                        username: newModUsername.trim().toLowerCase(),
                        pin: newModPin.trim(),
                        name: newModName.trim() || 'মডারেটর ইউজার',
                        role: newModRole,
                        status: 'active',
                        createdAt: new Date().toISOString().split('T')[0]
                      };
                      const updatedMods = [...currentMods, newMod];
                      const newSettings = { ...appSettings, moderatorUsers: updatedMods };
                      setAppSettings(newSettings);
                      saveAppSettings(newSettings);
                      setNewModUsername('');
                      setNewModPin('');
                      setNewModName('');
                      alert('নতুন মডারেটর ইউজার সফলভাবে তৈরি করা হয়েছে!');
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>মডারেটর যুক্ত করুন</span>
                  </button>
                </div>
              </div>

              {/* List of Active Moderator Users */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                  <span>নিবন্ধিত মডারেটরদের তালিকা:</span>
                  <span className="text-xs text-slate-500 font-normal">
                    মোট: {(appSettings.moderatorUsers || []).length} জন
                  </span>
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">ইউজারনেম</th>
                        <th className="p-3">নাম</th>
                        <th className="p-3">পাসওয়ার্ড / পিন</th>
                        <th className="p-3">রোল</th>
                        <th className="p-3">স্ট্যাটাস</th>
                        <th className="p-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(appSettings.moderatorUsers || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-500">
                            কোনো মডারেটর অ্যাকাউন্ট তৈরি করা হয়নি। উপরের ফর্ম থেকে নতুন মডারেটর যোগ করুন।
                          </td>
                        </tr>
                      ) : (
                        (appSettings.moderatorUsers || []).map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold text-blue-700">{m.username}</td>
                            <td className="p-3 font-bold text-slate-900">{m.name}</td>
                            <td className="p-3 font-mono text-slate-600">{m.pin}</td>
                            <td className="p-3">
                              <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                                {m.role}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {m.status === 'active' ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentMods = appSettings.moderatorUsers || [];
                                    const updatedMods = currentMods.map(item => 
                                      item.id === m.id ? { ...item, status: (item.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' } : item
                                    );
                                    const newSettings = { ...appSettings, moderatorUsers: updatedMods };
                                    setAppSettings(newSettings);
                                    saveAppSettings(newSettings);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                    m.status === 'active' ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                                  }`}
                                >
                                  {m.status === 'active' ? 'ডিঅ্যাক্টিভ করুন' : 'অ্যাক্টিভ করুন'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!window.confirm('আপনি কি নিশ্চিত যে এই মডারেটর ইউজারটি মুছে ফেলতে চান?')) return;
                                    const currentMods = appSettings.moderatorUsers || [];
                                    const updatedMods = currentMods.filter(item => item.id !== m.id);
                                    const newSettings = { ...appSettings, moderatorUsers: updatedMods };
                                    setAppSettings(newSettings);
                                    saveAppSettings(newSettings);
                                  }}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Delete Moderator"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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

      {/* Delete Confirmation Popup Modal */}
      {deleteConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  আবেদন ডিলিট নিশ্চিতকরণ
                </h3>
                <p className="text-xs text-rose-600 font-bold">
                  এই অ্যাকশনটি সম্পূর্ণ স্থায়ী এবং রিকভার করা যাবে না
                </p>
              </div>
            </div>

            {/* Order Details Preview Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-mono">
                <span className="text-slate-500 font-bold">Order ID:</span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {deleteConfirmOrder.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold text-slate-800">{deleteConfirmOrder.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">রোল ও বোর্ড:</span>
                  <span className="font-bold text-slate-800">{deleteConfirmOrder.roll} ({deleteConfirmOrder.board})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">মোবাইল নম্বর:</span>
                  <span className="font-mono font-bold text-slate-800">{deleteConfirmOrder.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">মোট ফি:</span>
                  <span className="font-mono font-extrabold text-emerald-700">৳{deleteConfirmOrder.totalFee} BDT</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              আপনি কি নিশ্চিত যে Order ID <strong className="font-mono text-slate-900 font-black">{deleteConfirmOrder.id}</strong> এর সম্পূর্ণ আবেদনটি ডাটাবেস থেকে স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                disabled={isDeleting}
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={confirmAndDeleteOrder}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, স্থায়ীভাবে ডিলিট করুন'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Student Order Information Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 font-bn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    শিক্ষার্থীর তথ্য সম্পাদন ও আপডেট করুন
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Order ID: <span className="font-bold text-blue-600">{editingOrder.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEditedOrder} className="space-y-4 text-xs sm:text-sm">
              
              {/* Student Name */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">শিক্ষার্থীর নাম (Student Name) *</label>
                <input
                  type="text"
                  required
                  value={editForm.studentName}
                  onChange={e => setEditForm({ ...editForm, studentName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Roll, Reg & Board */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">রোল নম্বর (Roll) *</label>
                  <input
                    type="text"
                    required
                    value={editForm.roll}
                    onChange={e => setEditForm({ ...editForm, roll: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">রেজিস্ট্রেশন নম্বর (Reg) *</label>
                  <input
                    type="text"
                    required
                    value={editForm.reg}
                    onChange={e => setEditForm({ ...editForm, reg: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">শিক্ষা বোর্ড *</label>
                  <select
                    value={editForm.board}
                    onChange={e => setEditForm({ ...editForm, board: e.target.value as EducationBoard })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {BOARDS_LIST.map(b => (
                      <option key={b.code} value={b.code}>{b.nameBn}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">মোবাইল নম্বর (Phone) *</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">হোয়াটসঅ্যাপ (WhatsApp)</label>
                  <input
                    type="tel"
                    value={editForm.whatsapp}
                    onChange={e => setEditForm({ ...editForm, whatsapp: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Father & Mother Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">পিতার নাম (Father's Name)</label>
                  <input
                    type="text"
                    value={editForm.fatherName}
                    onChange={e => setEditForm({ ...editForm, fatherName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">মাতার নাম (Mother's Name)</label>
                  <input
                    type="text"
                    value={editForm.motherName}
                    onChange={e => setEditForm({ ...editForm, motherName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Payment Details: TrxID, Sender Phone, Method, Total Fee */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">ট্রানজেকশন ID</label>
                  <input
                    type="text"
                    required
                    value={editForm.trxId}
                    onChange={e => setEditForm({ ...editForm, trxId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono uppercase font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">প্রেরক নম্বর</label>
                  <input
                    type="text"
                    value={editForm.paymentSenderPhone}
                    onChange={e => setEditForm({ ...editForm, paymentSenderPhone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">পেমেন্ট মেথড</label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-xs"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Upay">Upay</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">মোট ফি (৳)</label>
                  <input
                    type="number"
                    value={editForm.totalFee}
                    onChange={e => setEditForm({ ...editForm, totalFee: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-xs text-emerald-700"
                  />
                </div>
              </div>

              {/* Subject Codes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">বিষয় কোডসমূহ (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 101, 107, 108"
                  value={editForm.subjects}
                  onChange={e => setEditForm({ ...editForm, subjects: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  বিষয় কোড পরিবর্তন করলে টেলিটক ১ম SMS কমান্ড স্বয়ংক্রিয়ভাবে পুনঃতৈরি হয়ে যাবে।
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                  disabled={isSavingEdit}
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingEdit ? 'সেভ করা হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
