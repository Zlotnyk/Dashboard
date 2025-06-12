import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import { Plus, BookOpen, Link as LinkIcon, Edit, Trash2, ExternalLink, AlertCircle, X } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useAuth } from '../../hooks/useAuth'
import '../../App.css'

function CourseMaterialsPage() {
  const { isAuthenticated, user } = useAuth()
  const [textbooks, setTextbooks] = useState([])
  const [onlineResources, setOnlineResources] = useState([])
  const [isTextbookModalOpen, setIsTextbookModalOpen] = useState(false)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  const [selectedTextbook, setSelectedTextbook] = useState(null)
  const [selectedResource, setSelectedResource] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const [textbookForm, setTextbookForm] = useState({
    title: '',
    author: '',
    course: '',
    whereToFind: '',
    purchaseLink: '',
    ownIt: false
  })

  const [resourceForm, setResourceForm] = useState({
    title: '',
    link: '',
    course: ''
  })

  // Load data from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const savedTextbooks = localStorage.getItem('courseTextbooks')
      const savedResources = localStorage.getItem('courseResources')
      
      if (savedTextbooks) {
        try {
          setTextbooks(JSON.parse(savedTextbooks))
        } catch (error) {
          console.error('Error parsing textbooks:', error)
        }
      }
      
      if (savedResources) {
        try {
          setOnlineResources(JSON.parse(savedResources))
        } catch (error) {
          console.error('Error parsing resources:', error)
        }
      }
    }
  }, [isAuthenticated])

  // Save to localStorage
  useEffect(() => {
    if (isAuthenticated && textbooks.length > 0) {
      localStorage.setItem('courseTextbooks', JSON.stringify(textbooks))
    }
  }, [textbooks, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && onlineResources.length > 0) {
      localStorage.setItem('courseResources', JSON.stringify(onlineResources))
    }
  }, [onlineResources, isAuthenticated])

  const validateTextbookForm = () => {
    const errors = {}
    
    if (!textbookForm.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!textbookForm.author.trim()) {
      errors.author = 'Author is required'
    }
    
    if (!textbookForm.course.trim()) {
      errors.course = 'Course is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateResourceForm = () => {
    const errors = {}
    
    if (!resourceForm.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!resourceForm.link.trim()) {
      errors.link = 'Link is required'
    } else if (!isValidUrl(resourceForm.link)) {
      errors.link = 'Please enter a valid URL'
    }
    
    if (!resourceForm.course.trim()) {
      errors.course = 'Course is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleTextbookFormChange = (field, value) => {
    setTextbookForm(prev => ({ ...prev, [field]: value }))
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleResourceFormChange = (field, value) => {
    setResourceForm(prev => ({ ...prev, [field]: value }))
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAddTextbook = () => {
    if (!isAuthenticated) {
      alert('Please sign in to add textbooks')
      return
    }

    setSelectedTextbook(null)
    setValidationErrors({})
    setTextbookForm({
      title: '',
      author: '',
      course: '',
      whereToFind: '',
      purchaseLink: '',
      ownIt: false
    })
    setIsTextbookModalOpen(true)
  }

  const handleEditTextbook = (textbook) => {
    if (!isAuthenticated) {
      alert('Please sign in to edit textbooks')
      return
    }

    setSelectedTextbook(textbook)
    setValidationErrors({})
    setTextbookForm({
      title: textbook.title,
      author: textbook.author,
      course: textbook.course,
      whereToFind: textbook.whereToFind || '',
      purchaseLink: textbook.purchaseLink || '',
      ownIt: textbook.ownIt || false
    })
    setIsTextbookModalOpen(true)
  }

  const handleSaveTextbook = () => {
    if (!validateTextbookForm()) {
      return
    }

    const textbookData = {
      ...textbookForm,
      id: selectedTextbook ? selectedTextbook.id : crypto.randomUUID(),
      createdAt: selectedTextbook ? selectedTextbook.createdAt : new Date().toISOString()
    }

    if (selectedTextbook) {
      setTextbooks(prev => prev.map(book => 
        book.id === selectedTextbook.id ? textbookData : book
      ))
    } else {
      setTextbooks(prev => [...prev, textbookData])
    }

    setIsTextbookModalOpen(false)
    setValidationErrors({})
    setTextbookForm({
      title: '',
      author: '',
      course: '',
      whereToFind: '',
      purchaseLink: '',
      ownIt: false
    })
    setSelectedTextbook(null)
  }

  const handleDeleteTextbook = (textbookId) => {
    setTextbooks(prev => prev.filter(book => book.id !== textbookId))
  }

  const handleAddResource = () => {
    if (!isAuthenticated) {
      alert('Please sign in to add resources')
      return
    }

    setSelectedResource(null)
    setValidationErrors({})
    setResourceForm({
      title: '',
      link: '',
      course: ''
    })
    setIsResourceModalOpen(true)
  }

  const handleEditResource = (resource) => {
    if (!isAuthenticated) {
      alert('Please sign in to edit resources')
      return
    }

    setSelectedResource(resource)
    setValidationErrors({})
    setResourceForm({
      title: resource.title,
      link: resource.link,
      course: resource.course
    })
    setIsResourceModalOpen(true)
  }

  const handleSaveResource = () => {
    if (!validateResourceForm()) {
      return
    }

    const resourceData = {
      ...resourceForm,
      id: selectedResource ? selectedResource.id : crypto.randomUUID(),
      createdAt: selectedResource ? selectedResource.createdAt : new Date().toISOString()
    }

    if (selectedResource) {
      setOnlineResources(prev => prev.map(resource => 
        resource.id === selectedResource.id ? resourceData : resource
      ))
    } else {
      setOnlineResources(prev => [...prev, resourceData])
    }

    setIsResourceModalOpen(false)
    setValidationErrors({})
    setResourceForm({
      title: '',
      link: '',
      course: ''
    })
    setSelectedResource(null)
  }

  const handleDeleteResource = (resourceId) => {
    setOnlineResources(prev => prev.filter(resource => resource.id !== resourceId))
  }

  const openLink = (url) => {
    if (url) {
      // Ensure URL has protocol
      const fullUrl = url.startsWith('http') ? url : `https://${url}`
      window.open(fullUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div>
      <div>
        <Navbar />
        <header className='relative'>
          <GifContainer />
        </header>
        <HeaderContent title="Course Materials" />
        <NavigationLinks />
        <WavyLines />
        <main className='flex w-full min-h-screen select-none'>
          {/* Left Section - 20% */}
          <section
            className='flex flex-col p-4 gap-4'
            style={{ width: '20%' }}
          >
            <FlipClock />
            <QuickLinks />
          </section>

          {/* Right Section - 80% */}
          <section
            className='flex flex-col p-4 gap-4 flex-1'
            style={{ width: '80%' }}
          >
            {/* Course Materials Content */}
            <div className='rounded-lg p-6 min-h-[600px]'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                  Course Materials
                </h2>
              </div>

              {/* Horizontal line under header */}
              <div className="w-full h-px bg-gray-700 mb-6"></div>

              {/* Info Box */}
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <BookOpen size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-medium mb-1">Plan your course material here.</p>
                    <p className="text-gray-300 text-sm italic">You can delete this after reading.</p>
                  </div>
                </div>
              </div>

              {/* Textbooks Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-yellow-400">
                    Textbooks
                  </h3>
                  <button
                    onClick={handleAddTextbook}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-80 transition-colors text-sm"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    <Plus size={16} />
                    New
                  </button>
                </div>

                {/* Textbooks Table */}
                <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#2a2a2a]">
                        <tr>
                          <th className="text-left p-4 text-gray-300 font-medium">Title</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Author</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Course</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Where to find</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Purchase Link</th>
                          <th className="text-center p-4 text-gray-300 font-medium">Own It?</th>
                          <th className="text-center p-4 text-gray-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {textbooks.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center p-8 text-gray-500">
                              No textbooks added yet. Click "New" to add your first textbook.
                            </td>
                          </tr>
                        ) : (
                          textbooks.map(textbook => (
                            <tr key={textbook.id} className="border-t border-gray-700 hover:bg-[#2a2a2a]/50">
                              <td className="p-4 text-white font-medium">{textbook.title}</td>
                              <td className="p-4 text-gray-300">{textbook.author}</td>
                              <td className="p-4 text-gray-300">{textbook.course}</td>
                              <td className="p-4 text-gray-300">{textbook.whereToFind || '-'}</td>
                              <td className="p-4">
                                {textbook.purchaseLink ? (
                                  <button
                                    onClick={() => openLink(textbook.purchaseLink)}
                                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <ExternalLink size={14} />
                                    Link
                                  </button>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={textbook.ownIt}
                                  readOnly
                                  className="w-4 h-4 rounded"
                                  style={{ accentColor: 'var(--accent-color)' }}
                                />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEditTextbook(textbook)}
                                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTextbook(textbook.id)}
                                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
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

              {/* Online Resources Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-yellow-400">
                    Online Resources
                  </h3>
                  <button
                    onClick={handleAddResource}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-80 transition-colors text-sm"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    <Plus size={16} />
                    New
                  </button>
                </div>

                {/* Online Resources Table */}
                <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#2a2a2a]">
                        <tr>
                          <th className="text-left p-4 text-gray-300 font-medium">Title</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Link</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Course</th>
                          <th className="text-center p-4 text-gray-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {onlineResources.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center p-8 text-gray-500">
                              No online resources added yet. Click "New" to add your first resource.
                            </td>
                          </tr>
                        ) : (
                          onlineResources.map(resource => (
                            <tr key={resource.id} className="border-t border-gray-700 hover:bg-[#2a2a2a]/50">
                              <td className="p-4 text-white font-medium">{resource.title}</td>
                              <td className="p-4">
                                <button
                                  onClick={() => openLink(resource.link)}
                                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <LinkIcon size={14} />
                                  <span className="truncate max-w-xs">{resource.link}</span>
                                  <ExternalLink size={12} />
                                </button>
                              </td>
                              <td className="p-4 text-gray-300">{resource.course}</td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEditResource(resource)}
                                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteResource(resource.id)}
                                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
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
            </div>
          </section>
        </main>
      </div>

      {/* Textbook Modal */}
      <Dialog open={isTextbookModalOpen} onClose={setIsTextbookModalOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-xl font-semibold text-white">
                    {selectedTextbook ? 'Edit Textbook' : 'Add Textbook'}
                  </DialogTitle>
                  <button
                    onClick={() => setIsTextbookModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={textbookForm.title}
                      onChange={(e) => handleTextbookFormChange('title', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent ${
                        validationErrors.title ? 'border-red-400' : 'border-gray-600'
                      }`}
                      placeholder="Enter textbook title"
                    />
                    {validationErrors.title && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-red-400 text-sm">{validationErrors.title}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Author *</label>
                    <input
                      type="text"
                      value={textbookForm.author}
                      onChange={(e) => handleTextbookFormChange('author', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent ${
                        validationErrors.author ? 'border-red-400' : 'border-gray-600'
                      }`}
                      placeholder="Enter author name"
                    />
                    {validationErrors.author && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-red-400 text-sm">{validationErrors.author}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Course *</label>
                    <input
                      type="text"
                      value={textbookForm.course}
                      onChange={(e) => handleTextbookFormChange('course', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent ${
                        validationErrors.course ? 'border-red-400' : 'border-gray-600'
                      }`}
                      placeholder="Enter course name"
                    />
                    {validationErrors.course && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-red-400 text-sm">{validationErrors.course}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Where to find</label>
                    <input
                      type="text"
                      value={textbookForm.whereToFind}
                      onChange={(e) => handleTextbookFormChange('whereToFind', e.target.value)}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Library, bookstore, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Purchase Link</label>
                    <input
                      type="url"
                      value={textbookForm.purchaseLink}
                      onChange={(e) => handleTextbookFormChange('purchaseLink', e.target.value)}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="ownIt"
                      checked={textbookForm.ownIt}
                      onChange={(e) => handleTextbookFormChange('ownIt', e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--accent-color)' }}
                    />
                    <label htmlFor="ownIt" className="text-gray-300">I own this textbook</label>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] px-6 py-4 border-t border-gray-700">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsTextbookModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTextbook}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                  >
                    {selectedTextbook ? 'Update' : 'Add'} Textbook
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Resource Modal */}
      <Dialog open={isResourceModalOpen} onClose={setIsResourceModalOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-xl font-semibold text-white">
                    {selectedResource ? 'Edit Resource' : 'Add Online Resource'}
                  </DialogTitle>
                  <button
                    onClick={() => setIsResourceModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={resourceForm.title}
                      onChange={(e) => handleResourceFormChange('title', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent ${
                        validationErrors.title ? 'border-red-400' : 'border-gray-600'
                      }`}
                      placeholder="Enter resource title"
                    />
                    {validationErrors.title && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-red-400 text-sm">{validationErrors.title}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Link *</label>
                    <input
                      type="url"
                      value={resourceForm.link}
                      onChange={(e) => handleResourceFormChange('link', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent ${
                        validationErrors.link ? 'border-red-400' : 'border-gray-600'
                      }`}
                      placeholder="https://..."
                    />
                    {validationErrors.link && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-red-400 text-sm">{validationErrors.link}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Course *</label>
                    <input
                      type="text"
                      value={resourceForm.course}
                      onChange={(e) => handleResourceFormChange('course', e.target.value)}
                      className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent ${
                        validationErrors.course ? 'border-red-400' : 'border-gray-600'
                      }`}
                      placeholder="Enter course name"
                    />
                    {validationErrors.course && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-red-400 text-sm">{validationErrors.course}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] px-6 py-4 border-t border-gray-700">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsResourceModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveResource}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                  >
                    {selectedResource ? 'Update' : 'Add'} Resource
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default CourseMaterialsPage