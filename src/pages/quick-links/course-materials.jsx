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
  const [showInfoBox, setShowInfoBox] = useState(true)

  // Editing states for inline editing
  const [editingTextbook, setEditingTextbook] = useState(null)
  const [editingResource, setEditingResource] = useState(null)
  const [editingValues, setEditingValues] = useState({})

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

  // Inline editing functions
  const startEditingTextbook = (textbook) => {
    if (!isAuthenticated) {
      alert('Please sign in to edit textbooks')
      return
    }
    setEditingTextbook(textbook.id)
    setEditingValues({
      title: textbook.title,
      author: textbook.author,
      course: textbook.course,
      whereToFind: textbook.whereToFind || '',
      purchaseLink: textbook.purchaseLink || '',
      ownIt: textbook.ownIt || false
    })
  }

  const startEditingResource = (resource) => {
    if (!isAuthenticated) {
      alert('Please sign in to edit resources')
      return
    }
    setEditingResource(resource.id)
    setEditingValues({
      title: resource.title,
      link: resource.link,
      course: resource.course
    })
  }

  const saveInlineEdit = (type, id) => {
    if (type === 'textbook') {
      const updatedTextbook = {
        ...textbooks.find(t => t.id === id),
        ...editingValues,
        id: id
      }
      setTextbooks(prev => prev.map(book => 
        book.id === id ? updatedTextbook : book
      ))
      setEditingTextbook(null)
    } else if (type === 'resource') {
      const updatedResource = {
        ...onlineResources.find(r => r.id === id),
        ...editingValues,
        id: id
      }
      setOnlineResources(prev => prev.map(resource => 
        resource.id === id ? updatedResource : resource
      ))
      setEditingResource(null)
    }
    setEditingValues({})
  }

  const cancelInlineEdit = () => {
    setEditingTextbook(null)
    setEditingResource(null)
    setEditingValues({})
  }

  const addNewTextbook = () => {
    if (!isAuthenticated) {
      alert('Please sign in to add textbooks')
      return
    }

    const newTextbook = {
      id: crypto.randomUUID(),
      title: '',
      author: '',
      course: '',
      whereToFind: '',
      purchaseLink: '',
      ownIt: false,
      createdAt: new Date().toISOString()
    }

    setTextbooks(prev => [...prev, newTextbook])
    startEditingTextbook(newTextbook)
  }

  const addNewResource = () => {
    if (!isAuthenticated) {
      alert('Please sign in to add resources')
      return
    }

    const newResource = {
      id: crypto.randomUUID(),
      title: '',
      link: '',
      course: '',
      createdAt: new Date().toISOString()
    }

    setOnlineResources(prev => [...prev, newResource])
    startEditingResource(newResource)
  }

  const handleDeleteTextbook = (textbookId) => {
    setTextbooks(prev => prev.filter(book => book.id !== textbookId))
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

  const handleEditingValueChange = (field, value) => {
    setEditingValues(prev => ({ ...prev, [field]: value }))
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

              {/* Info Box with close button */}
              {showInfoBox && (
                <div className="border rounded-lg p-4 mb-6 relative" style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--accent-color) 20%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)'
                }}>
                  <button
                    onClick={() => setShowInfoBox(false)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-black/20 transition-colors"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-start gap-3 pr-8">
                    <BookOpen size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--accent-color)' }}>Plan your course material here.</p>
                      <p className="text-gray-300 text-sm italic">You can delete this after reading.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Textbooks Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Textbooks
                  </h3>
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
                        {textbooks.map(textbook => (
                          <tr key={textbook.id} className="border-t border-gray-700 hover:bg-[#2a2a2a]/50">
                            <td className="p-4">
                              {editingTextbook === textbook.id ? (
                                <input
                                  type="text"
                                  value={editingValues.title || ''}
                                  onChange={(e) => handleEditingValueChange('title', e.target.value)}
                                  className="w-full bg-transparent text-white border-b border-gray-600 focus:border-accent outline-none"
                                  placeholder="Enter title"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-white font-medium">{textbook.title || 'Untitled'}</span>
                              )}
                            </td>
                            <td className="p-4">
                              {editingTextbook === textbook.id ? (
                                <input
                                  type="text"
                                  value={editingValues.author || ''}
                                  onChange={(e) => handleEditingValueChange('author', e.target.value)}
                                  className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                  placeholder="Enter author"
                                />
                              ) : (
                                <span className="text-gray-300">{textbook.author || '-'}</span>
                              )}
                            </td>
                            <td className="p-4">
                              {editingTextbook === textbook.id ? (
                                <input
                                  type="text"
                                  value={editingValues.course || ''}
                                  onChange={(e) => handleEditingValueChange('course', e.target.value)}
                                  className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                  placeholder="Enter course"
                                />
                              ) : (
                                <span className="text-gray-300">{textbook.course || '-'}</span>
                              )}
                            </td>
                            <td className="p-4">
                              {editingTextbook === textbook.id ? (
                                <input
                                  type="text"
                                  value={editingValues.whereToFind || ''}
                                  onChange={(e) => handleEditingValueChange('whereToFind', e.target.value)}
                                  className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                  placeholder="Where to find"
                                />
                              ) : (
                                <span className="text-gray-300">{textbook.whereToFind || '-'}</span>
                              )}
                            </td>
                            <td className="p-4">
                              {editingTextbook === textbook.id ? (
                                <input
                                  type="url"
                                  value={editingValues.purchaseLink || ''}
                                  onChange={(e) => handleEditingValueChange('purchaseLink', e.target.value)}
                                  className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                  placeholder="https://..."
                                />
                              ) : (
                                textbook.purchaseLink ? (
                                  <button
                                    onClick={() => openLink(textbook.purchaseLink)}
                                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <ExternalLink size={14} />
                                    Link
                                  </button>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {editingTextbook === textbook.id ? (
                                <input
                                  type="checkbox"
                                  checked={editingValues.ownIt || false}
                                  onChange={(e) => handleEditingValueChange('ownIt', e.target.checked)}
                                  className="w-4 h-4 rounded"
                                  style={{ accentColor: 'var(--accent-color)' }}
                                />
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={textbook.ownIt}
                                  readOnly
                                  className="w-4 h-4 rounded"
                                  style={{ accentColor: 'var(--accent-color)' }}
                                />
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                {editingTextbook === textbook.id ? (
                                  <>
                                    <button
                                      onClick={() => saveInlineEdit('textbook', textbook.id)}
                                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                                      title="Save"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={cancelInlineEdit}
                                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                      title="Cancel"
                                    >
                                      ✕
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditingTextbook(textbook)}
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
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {/* Add new row button */}
                        <tr>
                          <td colSpan="7" className="p-4">
                            <button
                              onClick={addNewTextbook}
                              className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-solid border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                            >
                              <Plus size={16} />
                              <span className="text-sm">New page</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Online Resources Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Online Resources
                  </h3>
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
                        {onlineResources.map(resource => (
                          <tr key={resource.id} className="border-t border-gray-700 hover:bg-[#2a2a2a]/50">
                            <td className="p-4">
                              {editingResource === resource.id ? (
                                <input
                                  type="text"
                                  value={editingValues.title || ''}
                                  onChange={(e) => handleEditingValueChange('title', e.target.value)}
                                  className="w-full bg-transparent text-white border-b border-gray-600 focus:border-accent outline-none"
                                  placeholder="Enter title"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-white font-medium">{resource.title || 'Untitled'}</span>
                              )}
                            </td>
                            <td className="p-4">
                              {editingResource === resource.id ? (
                                <input
                                  type="url"
                                  value={editingValues.link || ''}
                                  onChange={(e) => handleEditingValueChange('link', e.target.value)}
                                  className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                  placeholder="https://..."
                                />
                              ) : (
                                resource.link ? (
                                  <button
                                    onClick={() => openLink(resource.link)}
                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <LinkIcon size={14} />
                                    <span className="truncate max-w-xs">{resource.link}</span>
                                    <ExternalLink size={12} />
                                  </button>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )
                              )}
                            </td>
                            <td className="p-4">
                              {editingResource === resource.id ? (
                                <input
                                  type="text"
                                  value={editingValues.course || ''}
                                  onChange={(e) => handleEditingValueChange('course', e.target.value)}
                                  className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                  placeholder="Enter course"
                                />
                              ) : (
                                <span className="text-gray-300">{resource.course || '-'}</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                {editingResource === resource.id ? (
                                  <>
                                    <button
                                      onClick={() => saveInlineEdit('resource', resource.id)}
                                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                                      title="Save"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={cancelInlineEdit}
                                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                      title="Cancel"
                                    >
                                      ✕
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditingResource(resource)}
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
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {/* Add new row button */}
                        <tr>
                          <td colSpan="4" className="p-4">
                            <button
                              onClick={addNewResource}
                              className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-solid border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                            >
                              <Plus size={16} />
                              <span className="text-sm">New page</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default CourseMaterialsPage