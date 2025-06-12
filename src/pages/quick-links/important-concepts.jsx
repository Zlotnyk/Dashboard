import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import { Plus, Target, Edit, Trash2, AlertCircle, X, ChevronDown, ChevronRight } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useAuth } from '../../hooks/useAuth'
import '../../App.css'

function ImportantConceptsPage() {
  const { isAuthenticated, user } = useAuth()
  const [concepts, setConcepts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedConcept, setSelectedConcept] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showInfoBox, setShowInfoBox] = useState(true)
  const [expandedConcepts, setExpandedConcepts] = useState(new Set())

  // Editing states for inline editing
  const [editingConcept, setEditingConcept] = useState(null)
  const [editingValues, setEditingValues] = useState({})

  const [conceptForm, setConceptForm] = useState({
    concept: '',
    definition: '',
    notes: ''
  })

  // Load data from localStorage
  useEffect(() => {
    const savedConcepts = localStorage.getItem('importantConcepts')
    
    if (savedConcepts) {
      try {
        setConcepts(JSON.parse(savedConcepts))
      } catch (error) {
        console.error('Error parsing concepts:', error)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (concepts.length > 0) {
      localStorage.setItem('importantConcepts', JSON.stringify(concepts))
    }
  }, [concepts])

  const validateForm = () => {
    const errors = {}
    
    if (!conceptForm.concept.trim()) {
      errors.concept = 'Concept name is required'
    }
    
    if (!conceptForm.definition.trim()) {
      errors.definition = 'Definition is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormChange = (field, value) => {
    setConceptForm(prev => ({ ...prev, [field]: value }))
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Inline editing functions
  const startEditingConcept = (concept) => {
    setEditingConcept(concept.id)
    setEditingValues({
      concept: concept.concept,
      definition: concept.definition,
      notes: concept.notes || ''
    })
  }

  const saveInlineEdit = (id) => {
    const updatedConcept = {
      ...concepts.find(c => c.id === id),
      ...editingValues,
      id: id
    }
    setConcepts(prev => prev.map(concept => 
      concept.id === id ? updatedConcept : concept
    ))
    setEditingConcept(null)
    setEditingValues({})
  }

  const cancelInlineEdit = () => {
    setEditingConcept(null)
    setEditingValues({})
  }

  const addNewConcept = () => {
    const newConcept = {
      id: crypto.randomUUID(),
      concept: '',
      definition: '',
      notes: '',
      createdAt: new Date().toISOString()
    }

    setConcepts(prev => [...prev, newConcept])
    startEditingConcept(newConcept)
  }

  const handleDeleteConcept = (conceptId) => {
    setConcepts(prev => prev.filter(concept => concept.id !== conceptId))
  }

  const handleEditingValueChange = (field, value) => {
    setEditingValues(prev => ({ ...prev, [field]: value }))
  }

  const toggleConceptExpansion = (conceptId) => {
    setExpandedConcepts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(conceptId)) {
        newSet.delete(conceptId)
      } else {
        newSet.add(conceptId)
      }
      return newSet
    })
  }

  return (
    <div>
      <div>
        <Navbar />
        <header className='relative'>
          <GifContainer />
        </header>
        <HeaderContent title="Important Concepts" />
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
            {/* Important Concepts Content */}
            <div className='rounded-lg p-6 min-h-[600px]'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                  Important Concepts
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
                    <Target size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--accent-color)' }}>Write down the most important study concepts here.</p>
                      <p className="text-gray-300 text-sm italic">To add a new concept, click + Add a new concept.</p>
                      <p className="text-gray-300 text-sm italic mt-2">You can delete this after reading.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Important Concepts Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Important Concepts
                  </h3>
                  <button
                    onClick={addNewConcept}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    Add a new concept
                  </button>
                </div>

                {/* Concepts List */}
                <div className="space-y-4">
                  {concepts.map(concept => {
                    const isExpanded = expandedConcepts.has(concept.id)
                    
                    return (
                      <div key={concept.id} className="bg-[#1a1a1a] rounded-lg border border-gray-700">
                        {/* Concept Header */}
                        <div className="p-4 border-b border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => toggleConceptExpansion(concept.id)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown size={20} />
                                ) : (
                                  <ChevronRight size={20} />
                                )}
                              </button>
                              
                              {editingConcept === concept.id ? (
                                <input
                                  type="text"
                                  value={editingValues.concept || ''}
                                  onChange={(e) => handleEditingValueChange('concept', e.target.value)}
                                  className="flex-1 bg-transparent text-white text-lg font-medium border-b border-gray-600 focus:border-accent outline-none"
                                  placeholder="Enter concept name"
                                  autoFocus
                                />
                              ) : (
                                <h4 
                                  className="text-white text-lg font-medium cursor-pointer flex-1"
                                  onClick={() => toggleConceptExpansion(concept.id)}
                                >
                                  {concept.concept || 'Concept'}
                                </h4>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {editingConcept === concept.id ? (
                                <>
                                  <button
                                    onClick={() => saveInlineEdit(concept.id)}
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
                                    onClick={() => startEditingConcept(concept)}
                                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteConcept(concept.id)}
                                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Concept Content (Expandable) */}
                        {isExpanded && (
                          <div className="p-4 space-y-4">
                            {/* Definition */}
                            <div>
                              <h5 className="text-accent font-medium mb-2 font-[Libre_Baskerville] italic">
                                Definition:
                              </h5>
                              {editingConcept === concept.id ? (
                                <textarea
                                  value={editingValues.definition || ''}
                                  onChange={(e) => handleEditingValueChange('definition', e.target.value)}
                                  className="w-full bg-transparent text-gray-300 border border-gray-600 rounded-lg p-3 focus:border-accent outline-none resize-none"
                                  placeholder="Enter definition"
                                  rows={3}
                                />
                              ) : (
                                <p className="text-gray-300 leading-relaxed">
                                  {concept.definition || 'No definition provided'}
                                </p>
                              )}
                            </div>

                            {/* Notes */}
                            <div>
                              <h5 className="text-accent font-medium mb-2 font-[Libre_Baskerville] italic">
                                Notes:
                              </h5>
                              {editingConcept === concept.id ? (
                                <textarea
                                  value={editingValues.notes || ''}
                                  onChange={(e) => handleEditingValueChange('notes', e.target.value)}
                                  className="w-full bg-transparent text-gray-300 border border-gray-600 rounded-lg p-3 focus:border-accent outline-none resize-none"
                                  placeholder="Enter additional notes"
                                  rows={3}
                                />
                              ) : (
                                <p className="text-gray-300 leading-relaxed">
                                  {concept.notes || 'No additional notes'}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Empty State */}
                  {concepts.length === 0 && (
                    <div className="text-center py-12">
                      <Target size={48} className="text-gray-600 mx-auto mb-4" />
                      <h3 className="text-gray-400 text-lg mb-2">No concepts yet</h3>
                      <p className="text-gray-500 mb-4">Start by adding your first important concept</p>
                      <button
                        onClick={addNewConcept}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm mx-auto"
                      >
                        <Plus size={16} />
                        Add a new concept
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default ImportantConceptsPage