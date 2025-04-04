import { useState, useRef, useEffect } from 'react'
import { X, Send, MessageCircle, ChevronDown, ChevronUp, ArrowLeft, Mail, Phone, Bot, BotMessageSquare, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { useIsMobile, useBreakpoint } from '../hooks/use-mobile'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { ScrollArea } from './ui/scroll-area'

interface Message {
  id: string
  isBot: boolean
  text: string
  timestamp: Date
  isLoading?: boolean
  feedbackType?: 'product_request' | 'complaint' | 'question' | 'suggestion' | 'navigate_products' | 'navigate_categories' | 'navigate_shops' | 'navigate_models' | 'navigate_contact' | 'navigate_faq' | 'human_agent' | 'order_help' | 'car_advice' | 'car_information' | 'warranty' | 'product_search' | 'other'
  saved?: boolean
  awaitingProductName?: boolean
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [contactEmail, setContactEmail] = useState('zabtteg@gmail.com')
  const [contactPhone, setContactPhone] = useState('01155003537')
  const [showContactForm, setShowContactForm] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [useSheetOnMobile, setUseSheetOnMobile] = useState(false)
  const [showFeedback, setShowFeedback] = useState<string | null>(null)
  const [pendingProductRequest, setPendingProductRequest] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isRtl = language === 'ar'
  const isMobile = useIsMobile()
  const breakpoint = useBreakpoint()

  useEffect(() => {
    if (breakpoint === 'mobile') {
      setUseSheetOnMobile(true)
    } else {
      setUseSheetOnMobile(false)
      if (isOpen) {
        setIsMinimized(false)
      }
    }
  }, [breakpoint, isOpen])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcomeMessage = '';
      
      if (user) {
        const fetchUserProfile = async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', user.id)
              .single();
            
            if (error) throw error;
            
            if (data && data.username) {
              const welcomeText = `👋 ${t('welcomeBack')}, ${data.username}! ${t('enhancedWelcomeBackMessage')}`;
              setMessages([
                {
                  id: '1',
                  isBot: true,
                  text: welcomeText,
                  timestamp: new Date()
                }
              ]);
            } else {
              setMessages([
                {
                  id: '1',
                  isBot: true,
                  text: `👋 ${t('welcomeBack')}! ${t('enhancedWelcomeBackMessage')}`,
                  timestamp: new Date()
                }
              ]);
            }
          } catch (error) {
            setMessages([
              {
                id: '1',
                isBot: true,
                text: `👋 ${t('welcomeBack')}! ${t('enhancedWelcomeBackMessage')}`,
                timestamp: new Date()
              }
            ]);
          }
        };
        
        fetchUserProfile();
      } else {
        setMessages([
          {
            id: '1',
            isBot: true,
            text: `👋 ${t('enhancedWelcomeMessage')}`,
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [isOpen, messages.length, t, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false)
      return
    }
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const minimizeChat = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsMinimized(true)
  }

  const closeChat = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsOpen(false)
  }

  const backToChat = () => {
    setShowContactForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      sendMessage()
    }
  }

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    setShowFeedback(messageId)
    
    setTimeout(() => {
      toast.success(isPositive ? t('thanksForPositiveFeedback') : t('thanksForFeedback'))
    }, 300)
  }

  const handleNavigationIntent = (feedbackType: string, productName?: string) => {
    if (feedbackType === 'navigate_products') {
      navigate('/products')
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === 'navigate_categories') {
      navigate('/categories')
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === 'navigate_shops') {
      navigate('/shops')
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === 'navigate_contact') {
      navigate('/contact')
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === 'navigate_faq') {
      navigate('/faq')
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === 'product_search' && productName) {
      navigate(`/search?q=${encodeURIComponent(productName)}`)
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    }
    
    return false
  }

  const processMessageWithNLP = async (userMessage: string, isProductNameResponse = false) => {
    try {
      if (isProductNameResponse && pendingProductRequest) {
        setPendingProductRequest(null)
        
        const confirmationMessage = t('productRequestConfirmation').replace('{productName}', userMessage);
        
        const { data, error } = await supabase.functions.invoke('chat-assistant', {
          body: { 
            message: pendingProductRequest,
            productName: userMessage,
            userId: user?.id || null,
            email: contactEmail || user?.email || null,
            phoneNumber: contactPhone || null
          }
        })

        if (error) throw error

        return {
          response: confirmationMessage,
          feedbackType: 'product_request',
          saved: true,
          productName: userMessage,
          carModel: data?.carModel || null,
          category: data?.category || null
        }
      }
      
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: { 
          message: userMessage,
          userId: user?.id || null,
          email: contactEmail || user?.email || null,
          phoneNumber: contactPhone || null
        }
      })

      if (error) throw error

      if (data.feedbackType === 'product_request' && !data.productName) {
        setPendingProductRequest(userMessage)
        
        return {
          response: t('productNameRequest'),
          feedbackType: 'awaiting_product_name',
          saved: false,
          productName: null,
          carModel: null,
          category: null,
          awaitingProductName: true
        }
      }

      return {
        response: data.response,
        feedbackType: data.feedbackType,
        saved: data.saved,
        productName: data.productName,
        carModel: data.carModel,
        category: data.category
      }
    } catch (error) {
      console.error('Error with NLP function:', error)
      return {
        response: t('chatbotErrorTechnical'),
        feedbackType: 'other',
        saved: false,
        productName: null,
        carModel: null,
        category: null
      }
    }
  }

  const simulateTypingEffect = (botMessage: Message, botMessageId: string) => {
    const typingSpeed = 10
    const words = botMessage.text.split(' ')
    let currentText = ''
    
    const typeWords = (index: number) => {
      if (index < words.length) {
        currentText += (index === 0 ? '' : ' ') + words[index]
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: currentText, isLoading: false } : msg
        ))
        setTimeout(() => typeWords(index + 1), typingSpeed)
      }
    }
    
    setIsTyping(true)
    typeWords(0)
    
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...botMessage, isLoading: false } : msg
      ))
    }, typingSpeed * words.length)
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return
    
    const userMessageId = Date.now().toString()
    const userMessage: Message = {
      id: userMessageId,
      isBot: false,
      text: inputValue,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    
    const botLoadingMessageId = (Date.now() + 1).toString()
    setMessages(prev => [
      ...prev, 
      {
        id: botLoadingMessageId,
        isBot: true,
        text: '...',
        timestamp: new Date(),
        isLoading: true
      }
    ])
    
    try {
      const awaitingProductName = messages.length > 0 && 
        messages[messages.length - 2]?.isBot && 
        messages[messages.length - 2]?.awaitingProductName;
      
      const nlpResult = await processMessageWithNLP(userMessage.text, awaitingProductName)
      
      const productName = nlpResult.productName
      
      const shouldNavigate = handleNavigationIntent(nlpResult.feedbackType as string, productName)
      
      if (shouldNavigate) {
        setMessages(prev => prev.filter(msg => msg.id !== botLoadingMessageId))
        return
      }
      
      setMessages(prev => prev.filter(msg => msg.id !== botLoadingMessageId))
      
      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        isBot: true,
        text: nlpResult.response,
        timestamp: new Date(),
        feedbackType: nlpResult.feedbackType as any,
        saved: nlpResult.saved,
        awaitingProductName: nlpResult.awaitingProductName
      }
      
      const quickBotMessage: Message = {
        ...botMessage,
        text: '',
        isLoading: true
      }
      
      const newBotMessageId = (Date.now() + 2).toString()
      setMessages(prev => [...prev, { ...quickBotMessage, id: newBotMessageId }])
      
      simulateTypingEffect(botMessage, newBotMessageId)
      
      if (nlpResult.saved && !user && !contactEmail && !contactPhone && !feedbackSubmitted) {
        setTimeout(() => {
          setShowContactForm(true)
        }, 800)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      
      setMessages(prev => prev.filter(msg => msg.id !== botLoadingMessageId))
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          isBot: true,
          text: t('chatbotError'),
          timestamp: new Date()
        }
      ])
    }
  }

  const submitContactInfo = async () => {
    let hasError = false;
    
    if (!contactPhone || contactPhone.length < 8) {
      toast.error("Please enter a valid phone number")
      hasError = true;
    }
    
    if (hasError) return;
    
    try {
      const feedbackMessages = messages.filter(msg => msg.isBot && msg.saved)
      if (feedbackMessages.length > 0) {
        const latestFeedback = feedbackMessages[feedbackMessages.length - 1]
        
        const userMessages = messages.filter(msg => !msg.isBot)
        const userMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1].text : ''
        
        await supabase.from('chat_feedback').insert({
          email: contactEmail || null,
          phone_number: contactPhone,
          feedback_type: latestFeedback.feedbackType || 'other',
          message: userMsg,
        })
        
        toast.success(t('feedbackSubmitted'))
        setShowContactForm(false)
        setFeedbackSubmitted(true)
        
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            isBot: true,
            text: t('thankYouForContactInfo'),
            timestamp: new Date()
          }
        ])
      }
    } catch (error) {
      console.error('Error saving contact info with feedback:', error)
      toast.error(t('errorSavingFeedback'))
    }
  }

  const navigateToPage = (path: string) => {
    navigate(path)
    closeChat()
  }

  const quickSuggestions = [
    { label: t('productRequest'), action: () => handleSuggestedQuestion("I need a part for my vehicle") },
    { label: t('orderHelp'), action: () => handleSuggestedQuestion("How do I order?") },
    { label: t('findDealers'), action: () => handleSuggestedQuestion("Where can I find dealers?") },
    { label: t('warrantyInfo'), action: () => handleSuggestedQuestion("Tell me about warranty") }
  ];

  const handleSuggestedQuestion = async (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      isBot: false,
      text: question,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    const botLoadingMessageId = (Date.now() + 1).toString()
    setMessages(prev => [
      ...prev, 
      {
        id: botLoadingMessageId,
        isBot: true,
        text: '...',
        timestamp: new Date(),
        isLoading: true
      }
    ])
    
    try {
      const nlpResult = await processMessageWithNLP(question)
      
      const shouldNavigate = handleNavigationIntent(nlpResult.feedbackType as string, nlpResult.productName)
      
      if (shouldNavigate) {
        setMessages(prev => prev.filter(msg => msg.id !== botLoadingMessageId))
        return
      }
      
      setMessages(prev => prev.filter(msg => msg.id !== botLoadingMessageId))
      
      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        isBot: true,
        text: nlpResult.response,
        timestamp: new Date(),
        feedbackType: nlpResult.feedbackType as any,
        saved: nlpResult.saved,
        awaitingProductName: nlpResult.awaitingProductName
      }
      
      const quickBotMessage: Message = {
        ...botMessage,
        text: '',
        isLoading: true
      }
      
      const newBotMessageId = (Date.now() + 2).toString()
      setMessages(prev => [...prev, { ...quickBotMessage, id: newBotMessageId }])
      
      simulateTypingEffect(botMessage, newBotMessageId)
    } catch (error) {
      console.error('Error processing suggested question:', error)
      
      setMessages(prev => prev.filter(msg => msg.id !== botLoadingMessageId))
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          isBot: true,
          text: t('chatbotError'),
          timestamp: new Date()
        }
      ])
    }
  }

  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      <div 
        className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-3 flex justify-between items-center cursor-pointer select-none sticky top-0 z-10"
        onClick={() => !useSheetOnMobile && setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <BotMessageSquare className="h-5 w-5" />
          <span className="font-medium">{showContactForm ? t('contactUs') : t('zabttAssistant')}</span>
        </div>
        <div className="flex items-center gap-1">
          {!useSheetOnMobile && (
            isMinimized ? (
              <ChevronUp className="h-5 w-5 hover:text-gray-200" />
            ) : (
              <>
                <button 
                  onClick={minimizeChat}
                  className="p-1 hover:bg-indigo-700 rounded"
                  aria-label={t('minimizeChat')}
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                <button 
                  onClick={closeChat}
                  className="p-1 hover:bg-indigo-700 rounded"
                  aria-label={t('closeChat')}
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            )
          )}
          {useSheetOnMobile && (
            <button 
              onClick={closeChat}
              className="p-1 hover:bg-indigo-700 rounded"
              aria-label={t('closeChat')}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-52px)] overflow-hidden">
          {showContactForm ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <button
                  onClick={backToChat}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t('backToChat')}
                </button>
              </div>
              <div className="p-4 flex-grow overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('contactInformation')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('pleaseProvideContactDetails')}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('phoneNumber')} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder={t('yourPhoneNumber')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('email')} ({t('optional')})
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={t('yourEmailAddress')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <button
                    onClick={submitContactInfo}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {t('submit')}
                  </button>
                  
                  <button
                    onClick={backToChat}
                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {t('skipForNow')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <ScrollArea 
                className="flex-1 overflow-visible"
                style={{ 
                  height: 'auto',
                  minHeight: '200px'
                }}
              >
                <div className="flex flex-col gap-3 p-3 min-h-full">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg ${
                          message.isBot
                            ? 'bg-white border border-gray-200 shadow-sm text-gray-800'
                            : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white'
                        } ${message.isLoading ? 'animate-pulse' : ''}`}
                      >
                        {message.isLoading ? (
                          <div className="flex items-center justify-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        ) : (
                          <>
                            {message.isBot && (
                              <div className="flex items-center mb-1 text-indigo-600 font-medium text-xs">
                                <BotMessageSquare className="h-3 w-3 mr-1" />
                                <span>Zabtt Assistant</span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              
                              {message.isBot && !message.isLoading && showFeedback !== message.id && (
                                <div className="flex space-x-1">
                                  <button 
                                    onClick={() => handleFeedback(message.id, true)}
                                    className="text-gray-400 hover:text-green-500 transition-colors"
                                    aria-label={t('helpful')}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleFeedback(message.id, false)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label={t('notHelpful')}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                              
                              {showFeedback === message.id && (
                                <span className="text-xs text-green-600">
                                  {t('feedbackReceived')}
                                </span>
                              )}
                            </div>
                            
                            {message.isBot && message.saved && (
                              <div className="mt-2 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded inline-block">
                                {message.feedbackType === 'product_request' ? t('expertProductRequestLogged') : 
                                message.feedbackType === 'complaint' ? t('expertComplaintLogged') : 
                                message.feedbackType === 'suggestion' ? t('expertSuggestionLogged') : ''}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div ref={messagesEndRef}></div>
                </div>
              </ScrollArea>
              
              {quickSuggestions.length > 0 && (
                <div className="p-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {quickSuggestions.map((suggestion, index) => (
                      <button 
                        key={index}
                        onClick={suggestion.action}
                        className="text-xs bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 px-2 py-1 rounded-full shadow-sm transition-colors"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-3 border-t border-gray-200 flex items-center gap-2 bg-white">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  placeholder={t('askZabtt')}
                  className="flex-1 border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className={`p-1.5 sm:p-2 rounded-full ${
                    inputValue.trim() && !isTyping
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:opacity-90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  } transition-colors`}
                  aria-label={t('send')}
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              
              <div className="p-2 border-t border-gray-200 flex justify-between items-center bg-white">
                <div className="flex gap-3 sm:gap-4 text-gray-500">
                  <a 
                    href="mailto:zabtteg@gmail.com" 
                    className="flex items-center gap-1 text-xs hover:text-indigo-600"
                  >
                    <Mail className="h-3 w-3" />
                    <span>{t('email')}</span>
                  </a>
                  <a 
                    href="tel:01155003537" 
                    className="flex items-center gap-1 text-xs hover:text-indigo-600"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{t('call')}</span>
                  </a>
                </div>
                <div>
                  <button 
                    onClick={() => navigateToPage('/contact')}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    {t('contactUs')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const getChatSize = () => {
    switch (breakpoint) {
      case 'largeDesktop':
        return { width: 'w-[400px]', height: 'h-[600px]', buttonSize: 'p-4' }
      case 'desktop':
        return { width: 'w-[380px]', height: 'h-[550px]', buttonSize: 'p-4' }
      case 'tablet':
        return { width: 'w-[350px]', height: 'h-[500px]', buttonSize: 'p-3' }
      case 'mobile':
      default:
        return { width: 'w-full max-w-[320px]', height: 'h-[450px]', buttonSize: 'p-3' }
    }
  }

  const { width, height, buttonSize } = getChatSize()

  if (useSheetOnMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-4 right-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white ${buttonSize} rounded-full shadow-lg hover:opacity-90 transition-all duration-300 z-50 flex items-center justify-center`}
          aria-label={t('chatWithUs')}
        >
          <BotMessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl bg-gray-50">
            {renderChatContent()}
          </SheetContent>
        </Sheet>
      </>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white ${buttonSize} rounded-full shadow-lg hover:opacity-90 transition-all duration-300 z-50 flex items-center justify-center`}
        aria-label={t('chatWithUs')}
      >
        <BotMessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    )
  }

  const mainChatPosition = isRtl ? 'left-4 sm:left-6 right-auto' : 'right-4 sm:right-6';

  return (
    <div className={`fixed bottom-4 sm:bottom-6 z-50 ${mainChatPosition}`}>
      <div 
        className={`bg-gray-50 rounded-lg shadow-xl ${isMinimized ? 'w-64 sm:w-72' : width} overflow-hidden flex flex-col transition-all duration-300 transform`}
        style={{ 
          maxHeight: isMinimized ? '60px' : '80vh',
          height: isMinimized ? 'auto' : height
        }}
      >
        {renderChatContent()}
      </div>
    </div>
  )
}
