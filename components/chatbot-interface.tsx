'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
  text: string
  sender: 'user' | 'bot'
}

type Mode = 'general' | 'grocery' | 'todo' | 'reminder'

export default function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I assist you today?", sender: 'bot' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [currentMode, setCurrentMode] = useState<Mode>('general')

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages(prev => [...prev, { text: inputMessage, sender: 'user' }])
      // Here you would typically call an API to get the bot's response
      // For this example, we'll just echo the mode
      setMessages(prev => [...prev, { text: `You're in ${currentMode} mode.`, sender: 'bot' }])
      setInputMessage('')
    }
  }

  const handleModeChange = (mode: Mode) => {
    setCurrentMode(mode)
    setMessages(prev => [...prev, { text: `Switched to ${mode} mode.`, sender: 'bot' }])
  }

  return (
    <div className="flex flex-col h-[600px] max-w-md mx-auto border rounded-lg overflow-hidden">
      <div className="bg-primary p-4 text-primary-foreground">
        <h2 className="text-2xl font-bold">WATFU</h2>
      </div>
      <ScrollArea className="flex-grow p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex space-x-2 mb-4">
          <Button
            variant={currentMode === 'general' ? 'default' : 'outline'}
            onClick={() => handleModeChange('general')}
          >
            Magic
          </Button>
          <Button
            variant={currentMode === 'grocery' ? 'default' : 'outline'}
            onClick={() => handleModeChange('grocery')}
          >
            Grocery List
          </Button>
          <Button
            variant={currentMode === 'todo' ? 'default' : 'outline'}
            onClick={() => handleModeChange('todo')}
          >
            Mode
          </Button>
        </div>
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


