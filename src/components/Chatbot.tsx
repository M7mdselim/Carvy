"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, MessageCircle, ChevronDown, ChevronUp, ArrowLeft, Mail, Phone, Bot, BotMessageSquare, Sparkles, ThumbsUp, ThumbsDown, Search, Mic, Paperclip } from 'lucide-react'
import { useLanguage } from "../contexts/LanguageContext"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { supabase } from "../lib/supabase"
import { toast } from "sonner"
import { useIsMobile, useBreakpoint } from "../hooks/use-mobile"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  isBot: boolean
  text: string
  timestamp: Date
  isLoading?: boolean
  feedbackType?: string
  saved?: boolean
  awaitingProductName?: boolean
  quickReplies?: QuickReply[]
  answers?: Answer[]
  attachments?: Attachment[]
  isError?: boolean
}

interface Answer {
  question: string
  answer: string
}

interface QuickReply {
  text: string
  action: string
}

interface Attachment {
  type: "image" | "file"
  url: string
  name: string
  size?: number
}

interface SuggestedQuestion {
  text: string
  category: string
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [showContactForm, setShowContactForm] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [useSheetOnMobile, setUseSheetOnMobile] = useState(false)
  const [showFeedback, setShowFeedback] = useState<string | null>(null)
  const [pendingProductRequest, setPendingProductRequest] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [selectedAttachments, setSelectedAttachments] = useState<File[]>([])
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [conversationContext, setConversationContext] = useState<string[]>([])
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isRtl = language === "ar"
  const isMobile = useIsMobile()
  const breakpoint = useBreakpoint()

  // Group messages by date for better organization
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = message.timestamp.toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
      return groups
    },
    {} as Record<string, Message[]>,
  )

  useEffect(() => {
    if (breakpoint === "mobile") {
      setUseSheetOnMobile(false)
    } else {
      setUseSheetOnMobile(false)
      if (isOpen) {
        setIsMinimized(false)
      }
    }
  }, [breakpoint, isOpen])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = ""

      if (user) {
        const fetchUserProfile = async () => {
          try {
            const { data, error } = await supabase.from("profiles").select("username").eq("id", user.id).single()

            if (error) throw error

            if (data && data.username) {
              const welcomeText = `Welcome back, ${data.username}. How may we assist you with your automotive parts needs today?`
              setMessages([
                {
                  id: "1",
                  isBot: true,
                  text: welcomeText,
                  timestamp: new Date(),
                  quickReplies: [
                    { text: t("howToOrder"), action: t("howDoIOrderQuestion") },
                    { text: t("trackOrder"), action: t("trackOrderQuestion") },
                    { text: t("findPart"), action: t("findPartQuestion") },
                  ],
                },
              ])
            } else {
              setMessages([
                {
                  id: "1",
                  isBot: true,
                  text: `Welcome back. How may we assist you with your automotive parts needs today?`,
                  timestamp: new Date(),
                  quickReplies: [
                    { text: t("howToOrder"), action: t("howDoIOrderQuestion") },
                    { text: t("trackOrder"), action: t("trackOrderQuestion") },
                    { text: t("findPart"), action: t("findPartQuestion") },
                  ],
                },
              ])
            }
          } catch (error) {
            setMessages([
              {
                id: "1",
                isBot: true,
                text: `Welcome back. How may we assist you with your automotive parts needs today?`,
                timestamp: new Date(),
                quickReplies: [
                  { text: t("howToOrder"), action: t("howDoIOrderQuestion") },
                  { text: t("trackOrder"), action: t("trackOrderQuestion") },
                  { text: t("findPart"), action: t("findPartQuestion") },
                ],
              },
            ])
          }
        }

        fetchUserProfile()
      } else {
        setMessages([
          {
            id: "1",
            isBot: true,
            text: `Welcome to Zabtt Automotive Parts. I'm your virtual assistant, ready to help you find the right parts for your vehicle. How may I assist you today?`,
            timestamp: new Date(),
            quickReplies: [
              { text: t("howToOrder"), action: t("howDoIOrderQuestion") },
              { text: t("trackOrder"), action: t("trackOrderQuestion") },
              { text: t("findPart"), action: t("findPartQuestion") },
            ],
          },
        ])
      }
    }
  }, [isOpen, messages.length, t, user])

  // Update conversation context when messages change
  useEffect(() => {
    // Extract the last 5 messages for context
    const recentMessages = messages.slice(-5).map((msg) => `${msg.isBot ? "Assistant" : "User"}: ${msg.text}`)
    setConversationContext(recentMessages)

    // Generate suggested questions based on conversation context
    if (messages.length > 0) {
      generateSuggestedQuestions(recentMessages)
    }
  }, [messages])

  // Generate suggested questions based on conversation context
  const generateSuggestedQuestions = async (context: string[]) => {
    // In a real implementation, this would call an AI service
    // For now, we'll use some predefined suggestions based on keywords

    const lastUserMessage =
      messages
        .filter((m) => !m.isBot)
        .pop()
        ?.text.toLowerCase() || ""

    const suggestions: SuggestedQuestion[] = []

    if (lastUserMessage.includes("part") || lastUserMessage.includes("product")) {
      suggestions.push({
        text: t("howLongIsWarranty"),
        category: "product",
      })
      suggestions.push({
        text: t("doYouHaveCompatibilityGuide"),
        category: "product",
      })
    }

    if (lastUserMessage.includes("order") || lastUserMessage.includes("shipping")) {
      suggestions.push({
        text: t("whatShippingOptions"),
        category: "order",
      })
      suggestions.push({
        text: t("canIChangeMyOrder"),
        category: "order",
      })
    }

    if (lastUserMessage.includes("return") || lastUserMessage.includes("refund")) {
      suggestions.push({
        text: t("whatIsReturnPolicy"),
        category: "returns",
      })
      suggestions.push({
        text: t("howToInitiateReturn"),
        category: "returns",
      })
    }

    // Always include some general questions
    if (suggestions.length < 3) {
      suggestions.push({
        text: t("doYouOfferDiscounts"),
        category: "general",
      })
      suggestions.push({
        text: t("howToContactSupport"),
        category: "general",
      })
    }

    setSuggestedQuestions(suggestions.slice(0, 4)) // Limit to 4 suggestions
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  useEffect(() => {
    if (searchQuery) {
      const filtered = messages.filter((message) => message.text.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredMessages(filtered)
    } else {
      setFilteredMessages([])
    }
  }, [searchQuery, messages])

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
    if (e.key === "Enter" && inputValue.trim()) {
      sendMessage()
    }
  }

  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    setShowFeedback(messageId);
  
    try {
      // Now 'await' works because the function is 'async'
      const { data, error } = await supabase.from("chat_feedback").insert({
        email: contactEmail || null,
        phone_number: contactPhone,
        feedback_type: 'other',
        message: 'No message provided',
      });
  
      if (error) {
        console.error("Error saving feedback:", error);
      } else {
        console.log("Feedback saved successfully:", data);
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
    }
  
    // Toast for feedback success
    setTimeout(() => {
      toast.success(isPositive ? t("thanksForPositiveFeedback") : t("thanksForFeedback"));
    }, 300);
  };

  // Parse message for questions
  const parseQuestionsFromMessage = (message: string): string[] => {
    // Split the message into sentences
    const sentences = message.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0)
    // Filter sentences that appear to be questions
    return sentences.filter((sentence) => {
      const trimmed = sentence.trim().toLowerCase()
      return (
        trimmed.includes("?") ||
        trimmed.startsWith("what") ||
        trimmed.startsWith("how") ||
        trimmed.startsWith("where") ||
        trimmed.startsWith("when") ||
        trimmed.startsWith("why") ||
        trimmed.startsWith("which") ||
        trimmed.startsWith("who") ||
        trimmed.startsWith("can") ||
        trimmed.startsWith("do") ||
        trimmed.startsWith("does") ||
        trimmed.startsWith("is") ||
        trimmed.startsWith("are") ||
        trimmed.includes("tell me about")
      )
    })
  }

  const handleNavigationIntent = (feedbackType: string, productName?: string) => {
    if (feedbackType === "navigate_products") {
      navigate("/products")
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === "navigate_categories") {
      navigate("/categories")
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === "navigate_orders") {
      navigate("/orders")
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === "navigate_shops") {
      navigate("/shops")
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === "navigate_contact") {
      navigate("/contact")
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === "navigate_faq") {
      navigate("/faq")
      if (isMobile) {
        closeChat()
      } else {
        minimizeChat()
      }
      return true
    } else if (feedbackType === "product_search" && productName) {
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

  const processMessageWithNLP = async (
    userMessage: string,
    isProductNameResponse = false,
    attachments: File[] = [],
  ) => {
    try {
      // Handle product name response
      if (isProductNameResponse && pendingProductRequest) {
        setPendingProductRequest(null)

        // More professional confirmation message
        const confirmationMessage = t("productRequestConfirmation")
          .replace("{productName}", userMessage)
          .concat(" Our product specialists will review your request and provide detailed information shortly.")

        const { data, error } = await supabase.functions.invoke("chat-assistant", {
          body: {
            message: pendingProductRequest,
            productName: userMessage,
            userId: user?.id || null,
            email: contactEmail || user?.email || null,
            phoneNumber: contactPhone || null,
          },
        })

        if (error) throw error

        return {
          response: confirmationMessage,
          feedbackType: "product_request",
          saved: true,
          productName: userMessage,
          carModel: data?.carModel || null,
          category: data?.category || null,
          quickReplies: [
            { text: t("browseProductCatalog"), action: t("showMeMoreProducts") },
            { text: t("checkOrderStatus"), action: t("orderStatus") },
          ],
        }
      }

      // Add professional tone to the response processing
      const enhanceResponseProfessionalism = (response: string): string => {
        // Replace casual phrases with more professional alternatives
        const casualPhrases = [
          { casual: "sure thing", professional: "certainly" },
          { casual: "no problem", professional: "absolutely" },
          { casual: "yeah", professional: "yes" },
          { casual: "ok", professional: "understood" },
          { casual: "thanks", professional: "thank you" },
          { casual: "sorry", professional: "we apologize" },
          { casual: "hey", professional: "hello" },
          { casual: "hi there", professional: "greetings" },
        ]

        let enhancedResponse = response
        casualPhrases.forEach((phrase) => {
          const regex = new RegExp(`\\b${phrase.casual}\\b`, "gi")
          enhancedResponse = enhancedResponse.replace(regex, phrase.professional)
        })

        return enhancedResponse
      }

      // Process attachments if any
      const attachmentData: Attachment[] = []
      if (attachments.length > 0) {
        // Upload attachments to storage
        for (const file of attachments) {
          try {
            const fileExt = file.name.split(".").pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `chat-attachments/${fileName}`

            const { data, error } = await supabase.storage.from("attachments").upload(filePath, file)

            if (error) throw error

            // Get public URL
            const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(filePath)

            attachmentData.push({
              type: file.type.startsWith("image/") ? "image" : "file",
              url: urlData.publicUrl,
              name: file.name,
              size: file.size,
            })
          } catch (err) {
            console.error("Error uploading attachment:", err)
          }
        }
      }

      // Parse multiple questions from user message
      const questions = parseQuestionsFromMessage(userMessage)

      // If multiple questions detected, process each one
      if (questions.length > 1) {
        const answers: Answer[] = []

        // Process each question and collect answers
        for (const question of questions) {
          const { data, error } = await supabase.functions.invoke("chat-assistant", {
            body: {
              message: question,
              userId: user?.id || null,
              email: contactEmail || user?.email || null,
              phoneNumber: contactPhone || null,
              context: conversationContext,
              attachments: attachmentData,
            },
          })

          if (error) throw error

          answers.push({
            question: question.trim(),
            answer: enhanceResponseProfessionalism(data.response),
          })
        }

        // Return combined response with multiple answers
        return {
          response: t("multipleQuestionsDetected"),
          feedbackType: "question",
          saved: false,
          productName: null,
          carModel: null,
          category: null,
          answers: answers,
          attachments: attachmentData,
          quickReplies: [
            { text: t("moreHelp"), action: t("canYouHelpMeWithSomethingElse") },
            { text: t("thankYou"), action: t("thanksForTheInformation") },
          ],
        }
      }

      // Standard single question/comment processing
      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: {
          message: userMessage,
          userId: user?.id || null,
          email: contactEmail || user?.email || null,
          phoneNumber: contactPhone || null,
          context: conversationContext,
          attachments: attachmentData,
        },
      })

      if (error) throw error

      if (data.feedbackType === 'product_request' && !data.productName && !data.response.includes("product name")) {
        // Only set pending product request if we're actually asking for a product name
        setPendingProductRequest(userMessage);

        return {
          response: t("productNameRequest"),
          feedbackType: "awaiting_product_name",
          saved: false,
          productName: null,
          carModel: null,
          category: null,
          awaitingProductName: true,
          attachments: attachmentData,
        };
      }

      // Add appropriate quick replies based on the feedback type
      let quickReplies: QuickReply[] = []

      switch (data.feedbackType) {
        case "product_request":
          quickReplies = [
            { text: t("browseMoreProducts"), action: t("showMoreProducts") },
            { text: t("findShopsNearMe"), action: t("whereCanIBuyThis") },
          ]
          break
        case "order_help":
          quickReplies = [
            { text: t("paymentMethods"), action: t("whatPaymentMethodsAreAccepted") },
            { text: t("shipping"), action: t("howLongDoesShippingTake") },
          ]
          break
        case "question":
          quickReplies = [
            { text: t("returnPolicy"), action: t("whatIsReturnPolicy") },
            { text: t("contactSupport"), action: t("speakToRepresentative") },
          ]
          break
        default:
          quickReplies = [
            { text: t("lookForParts"), action: t("iNeedToFindAPart") },
            { text: t("askQuestion"), action: t("iHaveAnotherQuestion") },
          ]
      }

      return {
        response: enhanceResponseProfessionalism(data.response),
        feedbackType: data.feedbackType,
        saved: data.saved,
        productName: data.productName,
        carModel: data.carModel,
        category: data.category,
        attachments: attachmentData,
        quickReplies,
      }
    } catch (error) {
      console.error("Error with NLP function:", error)
      return {
        response: t("chatbotErrorTechnical"),
        feedbackType: "other",
        saved: false,
        productName: null,
        carModel: null,
        category: null,
        isError: true,
        quickReplies: [
          { text: t("tryAgain"), action: t("canYouHelpMeAgain") },
          { text: t("contactSupport"), action: t("connectToHuman") },
        ],
      }
    }
  }

  const simulateTypingEffect = (botMessage: Message, botMessageId: string) => {
    const words = botMessage.text.split(" ")
    let currentText = ""

    // Calculate a more professional typing speed based on message length and complexity
    const messageLength = botMessage.text.length
    const messageComplexity = botMessage.text.split(/[.!?]/).length

    // Longer, more complex messages should appear to take more "thinking" time
    const baseDelay = Math.min(15, Math.max(8, 20 - messageLength / 120))

    // Add a slight initial delay to simulate "thinking" before responding
    setTimeout(() => {
      const typeWords = (index: number) => {
        if (index < words.length) {
          currentText += (index === 0 ? "" : " ") + words[index]
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: currentText, isLoading: index < words.length - 1 } : msg,
            ),
          )

          // Add natural pauses at punctuation
          const lastChar = words[index].slice(-1)
          const punctuationPause = [".", "!", "?", ",", ":"].includes(lastChar)
            ? lastChar === "." || lastChar === "!" || lastChar === "?"
              ? 300
              : 150
            : 0

          // Add random variation to typing speed for more natural effect
          const randomVariation = Math.random() * 15 - 5 // -5 to +10 ms variation
          setTimeout(() => typeWords(index + 1), baseDelay + randomVariation + punctuationPause)
        }
      }

      setIsTyping(true)
      typeWords(0)

      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => prev.map((msg) => (msg.id === botMessageId ? { ...botMessage, isLoading: false } : msg)))
      }, baseDelay * words.length)
    }, messageComplexity * 100) // Initial "thinking" delay based on message complexity
  }

  const handleFileSelection = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setSelectedAttachments(files)

      // Preview for images
      toast.success(`${files.length} ${files.length === 1 ? t("fileSelected") : t("filesSelected")}`)
    }
  }

  const startVoiceRecording = async () => {
    try {
      setIsRecording(true)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data)
      })

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        const audioFile = new File([audioBlob], "voice-message.wav", { type: "audio/wav" })

        // Process the voice recording
        processVoiceRecording(audioFile)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      })

      // Start recording
      mediaRecorder.start()

      // Stop recording after 10 seconds if user doesn't stop it
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop()
          setIsRecording(false)
        }
      }, 10000)

      // Set up UI for recording state
      toast.info(t("recordingStarted"), {
        action: {
          label: t("stopRecording"),
          onClick: () => {
            if (mediaRecorder.state === "recording") {
              mediaRecorder.stop()
              setIsRecording(false)
            }
          },
        },
      })
    } catch (error) {
      console.error("Error starting voice recording:", error)
      toast.error(t("microphoneAccessDenied"))
      setIsRecording(false)
    }
  }

  const processVoiceRecording = async (audioFile: File) => {
    setIsProcessingVoice(true)

    try {
      // In a real implementation, you would send this to a speech-to-text service
      // For now, we'll simulate it

      // Upload the audio file
      const fileName = `voice-${Date.now()}.wav`
      const filePath = `voice-recordings/${fileName}`

      const { data, error } = await supabase.storage.from("attachments").upload(filePath, audioFile)

      if (error) throw error

      // Simulate speech-to-text processing
      setTimeout(() => {
        // Simulate a transcribed message
        const simulatedText = "I need help finding brake pads for a 2018 Toyota Camry"
        setInputValue(simulatedText)
        setIsProcessingVoice(false)

        toast.success(t("voiceTranscribed"))
      }, 1500)
    } catch (error) {
      console.error("Error processing voice recording:", error)
      toast.error(t("voiceProcessingError"))
      setIsProcessingVoice(false)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() && selectedAttachments.length === 0) return

    const userMessageId = Date.now().toString()
    const userMessage: Message = {
      id: userMessageId,
      isBot: false,
      text: inputValue.trim(),
      timestamp: new Date(),
      attachments:
        selectedAttachments.length > 0
          ? selectedAttachments.map((file) => ({
              type: file.type.startsWith("image/") ? "image" : "file",
              url: URL.createObjectURL(file),
              name: file.name,
              size: file.size,
            }))
          : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setSelectedAttachments([])

    const botLoadingMessageId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: botLoadingMessageId,
        isBot: true,
        text: "...",
        timestamp: new Date(),
        isLoading: true,
      },
    ])

    try {
      const awaitingProductName =
        messages.length > 0 &&
        messages[messages.length - 2]?.isBot &&
        messages[messages.length - 2]?.awaitingProductName

      const nlpResult = await processMessageWithNLP(
        userMessage.text || t("imageAttached"),
        awaitingProductName,
        selectedAttachments,
      )

      const productName = nlpResult.productName

      const shouldNavigate = handleNavigationIntent(nlpResult.feedbackType as string, productName)

      if (shouldNavigate) {
        setMessages((prev) => prev.filter((msg) => msg.id !== botLoadingMessageId))
        return
      }

      setMessages((prev) => prev.filter((msg) => msg.id !== botLoadingMessageId))

      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        isBot: true,
        text: nlpResult.response,
        timestamp: new Date(),
        feedbackType: nlpResult.feedbackType,
        saved: nlpResult.saved,
        awaitingProductName: nlpResult.awaitingProductName,
        quickReplies: nlpResult.quickReplies,
        answers: nlpResult.answers,
        attachments: nlpResult.attachments,
        isError: nlpResult.isError,
      }

      const quickBotMessage: Message = {
        ...botMessage,
        text: "",
        isLoading: true,
      }

      const newBotMessageId = (Date.now() + 2).toString()
      setMessages((prev) => [...prev, { ...quickBotMessage, id: newBotMessageId }])

      simulateTypingEffect(botMessage, newBotMessageId)

      if (nlpResult.saved && !user && !contactEmail && !contactPhone && !feedbackSubmitted) {
        setTimeout(() => {
          setShowContactForm(true)
        }, 800)
      }
    } catch (error) {
      console.error("Error processing message:", error)

      setMessages((prev) => prev.filter((msg) => msg.id !== botLoadingMessageId))

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          isBot: true,
          text: t("chatbotError"),
          timestamp: new Date(),
          isError: true,
          quickReplies: [
            { text: t("tryAgain"), action: t("canYouHelpMeAgain") },
            { text: t("contactSupport"), action: t("speakToHuman") },
          ],
        },
      ])
    }
  }

  const submitContactInfo = async () => {
    let hasError = false

    if (!contactPhone || contactPhone.length < 8) {
      toast.error(t("invalidPhoneNumber"))
      hasError = true
    }

    if (hasError) return

    try {
      const feedbackMessages = messages.filter((msg) => msg.isBot && msg.saved)
      if (feedbackMessages.length > 0) {
        const latestFeedback = feedbackMessages[feedbackMessages.length - 1]

        const userMessages = messages.filter((msg) => !msg.isBot)
        const userMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1].text : ""

        await supabase.from("chat_feedback").insert({
          email: contactEmail || null,
          phone_number: contactPhone,
          feedback_type: latestFeedback.feedbackType || "other",
          message: userMsg,
        })

        toast.success(t("feedbackSubmitted"))
        setShowContactForm(false)
        setFeedbackSubmitted(true)

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            isBot: true,
            text: t("thankYouForContactInfo"),
            timestamp: new Date(),
            quickReplies: [
              { text: t("browseProducts"), action: t("showMeAvailableProducts") },
              { text: t("findShops"), action: t("whereCanIBuy") },
            ],
          },
        ])
      }
    } catch (error) {
      console.error("Error saving contact info with feedback:", error)
      toast.error(t("errorSavingFeedback"))
    }
  }

  const navigateToPage = (path: string) => {
    navigate(path)
    closeChat()
  }

  const handleQuickReplyClick = (reply: string) => {
    setInputValue(reply)
    setTimeout(() => {
      sendMessage()
    }, 100)
  }

  const handleSuggestedQuestion = async (question: string) => {
    // Set active tab back to chat
    setActiveTab("chat")

    const userMessage: Message = {
      id: Date.now().toString(),
      isBot: false,
      text: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    const botLoadingMessageId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: botLoadingMessageId,
        isBot: true,
        text: "...",
        timestamp: new Date(),
        isLoading: true,
      },
    ])

    try {
      const nlpResult = await processMessageWithNLP(question)

      const shouldNavigate = handleNavigationIntent(nlpResult.feedbackType as string, nlpResult.productName)

      if (shouldNavigate) {
        setMessages((prev) => prev.filter((msg) => msg.id !== botLoadingMessageId))
        return
      }

      setMessages((prev) => prev.filter((msg) => msg.id !== botLoadingMessageId))

      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        isBot: true,
        text: nlpResult.response,
        timestamp: new Date(),
        feedbackType: nlpResult.feedbackType,
        saved: nlpResult.saved,
        awaitingProductName: nlpResult.awaitingProductName,
        quickReplies: nlpResult.quickReplies,
        answers: nlpResult.answers,
      }

      const quickBotMessage: Message = {
        ...botMessage,
        text: "",
        isLoading: true,
      }

      const newBotMessageId = (Date.now() + 2).toString()
      setMessages((prev) => [...prev, { ...quickBotMessage, id: newBotMessageId }])

      simulateTypingEffect(botMessage, newBotMessageId)
    } catch (error) {
      console.error("Error processing suggested question:", error)

      setMessages((prev) => prev.filter((msg) => msg.id !== botLoadingMessageId))

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          isBot: true,
          text: t("chatbotError"),
          timestamp: new Date(),
          isError: true,
        },
      ])
    }
  }

  const clearChat = () => {
    // Ask for confirmation
    if (messages.length > 1) {
      if (window.confirm(t("clearChatConfirmation"))) {
        // Keep only the welcome message
        const welcomeMessage = messages.find((msg) => msg.id === "1")
        setMessages(welcomeMessage ? [welcomeMessage] : [])
        toast.success(t("chatCleared"))
      }
    }
  }

  const renderAttachment = (attachment: Attachment) => {
    if (attachment.type === "image") {
      return (
        <div className="mt-2 relative group">
          <img
            src={attachment.url || "/placeholder.svg"}
            alt={attachment.name}
            className="max-w-full rounded-md max-h-48 object-cover cursor-pointer hover:opacity-90"
            onClick={() => window.open(attachment.url, "_blank")}
          />
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {attachment.name}
          </div>
        </div>
      )
    } else {
      return (
        <div className="mt-2">
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Paperclip className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700 truncate">{attachment.name}</span>
            {attachment.size && <span className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</span>}
          </a>
        </div>
      )
    }
  }

  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      <div
        className="bg-gradient-to-r from-purple-600 to-violet-500 text-white p-3 flex justify-between items-center cursor-pointer select-none sticky top-0 z-10"
        onClick={() => !useSheetOnMobile && setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <BotMessageSquare className="h-5 w-5" />
          <span className="font-medium">{showContactForm ? t("contactUs") : t("zabttAssistant")}</span>
          {isTyping && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse">{t("typing")}...</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!useSheetOnMobile &&
            (isMinimized ? (
              <ChevronUp className="h-5 w-5 hover:text-gray-200" />
            ) : (
              <>
                <button
                  onClick={minimizeChat}
                  className="p-1 hover:bg-purple-700 rounded"
                  aria-label={t("minimizeChat")}
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                <button onClick={closeChat} className="p-1 hover:bg-purple-700 rounded" aria-label={t("closeChat")}>
                  <X className="h-5 w-5" />
                </button>
              </>
            ))}
          {useSheetOnMobile && (
            <button onClick={closeChat} className="p-1 hover:bg-purple-700 rounded" aria-label={t("closeChat")}>
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
                  className="flex items-center text-sm text-purple-600 hover:text-purple-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("backToChat")}
                </button>
              </div>
              <div className="p-4 flex-grow overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("contactInformation")}</h3>
                <p className="text-sm text-gray-600 mb-4">{t("pleaseProvideContactDetails")}</p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("phoneNumber")} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder={t("yourPhoneNumber")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("email")} ({t("optional")})
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={t("yourEmailAddress")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <Button onClick={submitContactInfo} className="w-full bg-purple-600 hover:bg-purple-700">
                    {t("submit")}
                  </Button>

                  <Button onClick={backToChat} variant="outline" className="w-full">
                    {t("skipForNow")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="chat" className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("chat")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="search" className="flex items-center gap-1">
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("search")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("suggestions")}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 border-none p-0">
                  <ScrollArea
                    className="flex-1 overflow-visible"
                    style={{
                      height: "auto",
                      minHeight: "200px",
                    }}
                  >
                    <div className="flex flex-col gap-3 p-3 min-h-full">
                      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                        <div key={date} className="space-y-3">
                          <div className="flex justify-center">
                            <Badge variant="outline" className="text-xs text-gray-500 bg-gray-50">
                              {new Date(date).toLocaleDateString(language, {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </Badge>
                          </div>

                          {dateMessages.map((message) => (
                            <AnimatePresence key={message.id}>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                              >
                                <div className="flex gap-2 max-w-[85%]">
                                  {message.isBot && (
                                    <Avatar className="h-8 w-8 mt-1">
                                      <AvatarImage src="/bot-avatar.png" alt="Bot" />
                                      <AvatarFallback className="bg-purple-100 text-purple-600">
                                        <Bot className="h-4 w-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                  )}

                                  <div
                                    className={`p-3 rounded-lg ${
                                      message.isBot
                                        ? "bg-white border border-gray-200 shadow-sm text-gray-800"
                                        : "bg-gradient-to-r from-purple-600 to-violet-500 text-white"
                                    } ${message.isLoading ? "animate-pulse" : ""} ${message.isError ? "border-red-300 bg-red-50" : ""}`}
                                  >
                                    {message.isLoading ? (
                                      <div className="flex items-center justify-center space-x-1">
                                        <div
                                          className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                                          style={{ animationDelay: "0ms" }}
                                        ></div>
                                        <div
                                          className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                                          style={{ animationDelay: "150ms" }}
                                        ></div>
                                        <div
                                          className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                                          style={{ animationDelay: "300ms" }}
                                        ></div>
                                      </div>
                                    ) : (
                                      <>
                                        {message.isBot && (
                                          <div className="flex items-center mb-1 text-purple-600 font-medium text-xs">
                                            <span>Zabtt Assistant</span>
                                            {message.isError && (
                                              <Badge variant="destructive" className="ml-2 text-[10px] py-0 px-1">
                                                {t("error")}
                                              </Badge>
                                            )}
                                          </div>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                                        {/* Attachments */}
                                        {message.attachments && message.attachments.length > 0 && (
                                          <div className="mt-2 space-y-2">
                                            {message.attachments.map((attachment, idx) => (
                                              <div key={`${message.id}-attachment-${idx}`}>
                                                {renderAttachment(attachment)}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Multiple Answers Section */}
                                        {message.isBot && message.answers && message.answers.length > 0 && (
                                          <div className="mt-3 space-y-3">
                                            {message.answers.map((answer, idx) => (
                                              <div
                                                key={`answer-${idx}`}
                                                className="p-3 bg-gray-50 rounded border border-gray-100"
                                              >
                                                <div className="font-medium text-sm text-purple-700 mb-1">
                                                  {answer.question}
                                                </div>
                                                <div className="text-sm text-gray-700">{answer.answer}</div>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Quick Replies Section */}
                                        {message.isBot &&
                                          message.quickReplies &&
                                          message.quickReplies.length > 0 &&
                                          !message.isLoading && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                              {message.quickReplies.map((reply, index) => (
                                                <button
                                                  key={`${message.id}-reply-${index}`}
                                                  onClick={() => handleQuickReplyClick(reply.action)}
                                                  className="py-1 px-3 bg-purple-50 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-100 transition-colors"
                                                >
                                                  {reply.text}
                                                </button>
                                              ))}
                                            </div>
                                          )}

                                        <div className="flex justify-between items-center mt-1">
                                          <p className="text-xs opacity-70">
                                            {message.timestamp.toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </p>

                                          {message.isBot && !message.isLoading && showFeedback !== message.id && (
                                            <div className="flex space-x-1">
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <button
                                                      onClick={() => handleFeedback(message.id, true)}
                                                      className="text-gray-400 hover:text-green-500 transition-colors"
                                                      aria-label={t("helpful")}
                                                    >
                                                      <ThumbsUp className="h-3 w-3" />
                                                    </button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>{t("markAsHelpful")}</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>

                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <button
                                                      onClick={() => handleFeedback(message.id, false)}
                                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                                      aria-label={t("notHelpful")}
                                                    >
                                                      <ThumbsDown className="h-3 w-3" />
                                                    </button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>{t("markAsNotHelpful")}</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </div>
                                          )}

                                          {showFeedback === message.id && (
                                            <span className="text-xs text-green-600">{t("feedbackReceived")}</span>
                                          )}
                                        </div>

                                        {message.isBot && message.saved && (
                                          <div className="mt-2 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded inline-block">
                                            {message.feedbackType === "product_request"
                                              ? t("expertProductRequestLogged")
                                              : message.feedbackType === "complaint"
                                                ? t("expertComplaintLogged")
                                                : message.feedbackType === "suggestion"
                                                  ? t("expertSuggestionLogged")
                                                  : ""}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {!message.isBot && (
                                    <Avatar className="h-8 w-8 mt-1 order-1">
                                      <AvatarFallback className="bg-purple-600 text-white">
                                        {user?.email?.charAt(0).toUpperCase() || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          ))}
                        </div>
                      ))}

                      <div ref={messagesEndRef}></div>
                    </div>
                  </ScrollArea>

                  {suggestedQuestions.length > 0 && (
                    <div className="p-2 border-t border-gray-200 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-2">{t("suggestedQuestions")}</p>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {suggestedQuestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestedQuestion(suggestion.text)}
                            className="text-xs bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 px-2 py-1 rounded-full shadow-sm transition-colors flex items-center gap-1"
                          >
                            <span>{suggestion.text}</span>
                            {suggestion.category && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1">
                                {suggestion.category}
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 border-t border-gray-200 flex items-center gap-2 bg-white">
                    {selectedAttachments.length > 0 && (
                      <div className="absolute -top-10 left-0 right-0 bg-white p-2 border-t border-gray-200 flex items-center gap-2 overflow-x-auto">
                        {selectedAttachments.map((file, index) => (
                          <div key={index} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs">
                            <span className="truncate max-w-[100px]">{file.name}</span>
                            <button
                              onClick={() => setSelectedAttachments((prev) => prev.filter((_, i) => i !== index))}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setSelectedAttachments([])}
                          className="text-xs text-gray-500 hover:text-red-500"
                        >
                          {t("clearAll")}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={handleFileSelection}
                              disabled={isTyping}
                            >
                              <Paperclip className="h-4 w-4 text-gray-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("attachFile")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 rounded-full ${isRecording ? "bg-red-100 text-red-500 animate-pulse" : ""}`}
                              onClick={startVoiceRecording}
                              disabled={isTyping || isRecording || isProcessingVoice}
                            >
                              <Mic className="h-4 w-4 text-gray-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isRecording ? t("recording") : t("voiceInput")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleInputKeyDown}
                      placeholder={isProcessingVoice ? t("processingVoice") : t("askZabtt")}
                      className="flex-1 border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isTyping || isProcessingVoice}
                    />

                    <Button
                      onClick={sendMessage}
                      disabled={(!inputValue.trim() && selectedAttachments.length === 0) || isTyping}
                      className={`p-1.5 sm:p-2 rounded-full ${
                        (inputValue.trim() || selectedAttachments.length > 0) && !isTyping
                          ? "bg-gradient-to-r from-purple-600 to-violet-500 text-white hover:opacity-90"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      } transition-colors`}
                      aria-label={t("send")}
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>

                  <div className="p-2 border-t border-gray-200 flex justify-between items-center bg-white">
                    <div className="flex gap-3 sm:gap-4 text-gray-500">
                      <a
                        href="mailto:zabtteg@gmail.com"
                        className="flex items-center gap-1 text-xs hover:text-purple-600"
                      >
                        <Mail className="h-3 w-3" />
                        <span>{t("email")}</span>
                      </a>
                      <a href="tel:01155003537" className="flex items-center gap-1 text-xs hover:text-purple-600">
                        <Phone className="h-3 w-3" />
                        <span>{t("call")}</span>
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-gray-500 hover:text-red-500"
                        onClick={clearChat}
                      >
                        {t("clearChat")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-purple-600 hover:text-purple-800"
                        onClick={() => navigateToPage("/contact")}
                      >
                        {t("contactUs")}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="search" className="flex-1 flex flex-col overflow-hidden m-0 border-none p-0">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("searchConversation")}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                      {searchQuery ? (
                        filteredMessages.length > 0 ? (
                          filteredMessages.map((message) => (
                            <Card key={message.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-start gap-2">
                                <Avatar className="h-6 w-6">
                                  {message.isBot ? (
                                    <AvatarFallback className="bg-purple-100 text-purple-600">
                                      <Bot className="h-3 w-3" />
                                    </AvatarFallback>
                                  ) : (
                                    <AvatarFallback className="bg-purple-600 text-white">
                                      {user?.email?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">
                                    {message.isBot ? "Zabtt Assistant" : t("you")} •{" "}
                                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </div>
                                  <p className="text-sm">{message.text}</p>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">{t("noSearchResults")}</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8">
                          <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">{t("searchPrompt")}</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="suggestions" className="flex-1 flex flex-col overflow-hidden m-0 border-none p-0">
                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">{t("popularQuestions")}</h3>
                        <div className="space-y-2">
                          {[
                            t("howDoITrackMyOrder"),
                            t("whatIsYourReturnPolicy"),
                            t("doYouShipInternationally"),
                            t("howCanIFindCompatibleParts"),
                          ].map((question, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-2 px-3 text-sm"
                              onClick={() => handleSuggestedQuestion(question)}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">{t("productCategories")}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: t("brakeParts"), icon: <span>🛑</span> },
                            { name: t("engineParts"), icon: <span>⚙️</span> },
                            { name: t("suspensionParts"), icon: <span>🔧</span> },
                            { name: t("electricalParts"), icon: <span>⚡</span> },
                          ].map((category, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="flex items-center gap-2 justify-start h-auto py-2"
                              onClick={() =>
                                handleSuggestedQuestion(t("tellMeAboutCategory").replace("{category}", category.name))
                              }
                            >
                              <span className="text-lg">{category.icon}</span>
                              <span className="text-sm">{category.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">{t("quickActions")}</h3>
                        <div className="space-y-2">
                          <Button
                            variant="default"
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={() => navigateToPage("/products")}
                          >
                            {t("browseProducts")}
                          </Button>
                          <Button variant="outline" className="w-full" onClick={() => navigateToPage("/contact")}>
                            {t("contactSupport")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const getChatSize = () => {
    switch (breakpoint) {
      case "largeDesktop":
        return { width: "w-[420px]", height: "h-[600px]", buttonSize: "p-4" }
      case "desktop":
        return { width: "w-[380px]", height: "h-[550px]", buttonSize: "p-4" }
      case "tablet":
        return { width: "w-[350px]", height: "h-[500px]", buttonSize: "p-3" }
      case "mobile":
      default:
        return { width: "w-full max-w-[320px]", height: "h-[450px]", buttonSize: "p-3" }
    }
  }

  const { width, height, buttonSize } = getChatSize()

  if (useSheetOnMobile) {
    return (
      <>
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-violet-500 text-white ${buttonSize} rounded-full shadow-lg hover:opacity-90 transition-all duration-300 z-50 flex items-center justify-center`}
          aria-label={t("chatWithUs")}
        >
          <BotMessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl bg-gray-50 flex flex-col">
            <div className="flex-1 overflow-y-auto">{renderChatContent()}</div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-purple-600 to-violet-500 text-white ${buttonSize} rounded-full shadow-lg hover:opacity-90 transition-all duration-300 z-50 flex items-center justify-center`}
        aria-label={t("chatWithUs")}
      >
        <BotMessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
      </motion.button>
    )
  }

  const mainChatPosition = isRtl ? "left-4 sm:left-6 right-auto" : "right-4 sm:right-6"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-4 sm:bottom-6 z-50 ${mainChatPosition}`}
    >
      <div
        className={`bg-gray-50 rounded-lg shadow-xl ${isMinimized ? "w-64 sm:w-72" : width} overflow-hidden flex flex-col transition-all duration-300 transform`}
        style={{
          maxHeight: isMinimized ? "60px" : "80vh",
          height: isMinimized ? "auto" : height,
        }}
      >
        <div className="flex-1 overflow-y-auto">{renderChatContent()}</div>
      </div>
    </motion.div>
  )
}
