import React, { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { X, Calendar, FileText, Flag, Clock, AlertCircle } from 'lucide-react';
import { formatDateToYYYYMMDD, parseYYYYMMDDToDate } from './timeline_utils';
import { toast } from 'react-hot-toast';

const TaskDrawer = ({ isOpen, task, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    status: 'Not started',
    priority: 'normal',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Save scroll position without fixing body position
  useEffect(() => {
    if (isOpen) {
      // Just prevent scrolling without changing position
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        start: formatDateToYYYYMMDD(task.start),
        end: formatDateToYYYYMMDD(task.end),
        status: task.status || 'Not started',
        priority: task.priority || 'normal',
      });
      // Clear validation errors when task changes
      setValidationErrors({});
    }
  }, [task]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.start) {
      errors.start = 'Start date is required';
    }
    
    if (!formData.end) {
      errors.end = 'End date is required';
    }
    
    if (formData.start && formData.end) {
      const startDate = new Date(formData.start);
      const endDate = new Date(formData.end);
      
      if (endDate < startDate) {
        errors.end = 'End date must be after or equal to start date';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task) return;
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const updatedTask = {
        ...task,
        title: formData.title,
        description: formData.description,
        start: parseYYYYMMDDToDate(formData.start),
        end: parseYYYYMMDDToDate(formData.end),
        status: formData.status,
        priority: formData.priority,
      };

      await onSave(updatedTask);
      // Toast notification is handled by the parent component
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    
    setLoading(true);
    try {
      await onDelete();
      // Toast notification is handled by the parent component
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto relative w-screen max-w-md transform transition duration-300 ease-in-out data-[closed]:translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 duration-300 ease-in-out data-[closed]:opacity-0 sm:-ml-10 sm:pr-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </TransitionChild>

              <div className="flex h-full flex-col overflow-y-scroll bg-[#1a1a1a] border-l border-gray-700 shadow-2xl">
                <div className="px-4 sm:px-6 py-6 border-b border-gray-700">
                  <DialogTitle className="text-lg font-semibold text-white">Task Details</DialogTitle>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                  <div className="flex-1 px-4 sm:px-6 space-y-6 overflow-y-auto py-6">
                    {/* Title */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <FileText size={16} />
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className={`w-full px-3 py-3 bg-transparent border-2 border-solid ${validationErrors.title ? 'border-red-400' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors`}
                        placeholder="Enter task title..."
                      />
                      {validationErrors.title && (
                        <div className="flex items-center gap-2 mt-1 text-red-400 text-sm">
                          <AlertCircle size={14} />
                          <span>{validationErrors.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <FileText size={16} />
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-3 bg-transparent border-2 border-solid border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
                        placeholder="Enter task description..."
                      />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                          <Calendar size={16} />
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.start}
                          onChange={(e) => handleChange('start', e.target.value)}
                          className={`w-full px-3 py-3 bg-transparent border-2 border-solid ${validationErrors.start ? 'border-red-400' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors`}
                        />
                        {validationErrors.start && (
                          <div className="flex items-center gap-2 mt-1 text-red-400 text-sm">
                            <AlertCircle size={14} />
                            <span>{validationErrors.start}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                          <Calendar size={16} />
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formData.end}
                          onChange={(e) => handleChange('end', e.target.value)}
                          min={formData.start}
                          className={`w-full px-3 py-3 bg-transparent border-2 border-solid ${validationErrors.end ? 'border-red-400' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors`}
                        />
                        {validationErrors.end && (
                          <div className="flex items-center gap-2 mt-1 text-red-400 text-sm">
                            <AlertCircle size={14} />
                            <span>{validationErrors.end}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <Clock size={16} />
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-3 py-3 bg-[#2a2a2a] border-2 border-solid border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="Not started" className="bg-[#2a2a2a]">Not started</option>
                        <option value="In progress" className="bg-[#2a2a2a]">In progress</option>
                        <option value="Completed" className="bg-[#2a2a2a]">Completed</option>
                        <option value="On hold" className="bg-[#2a2a2a]">On hold</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <Flag size={16} />
                        Priority
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleChange('priority', 'normal')}
                          className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            formData.priority === 'normal'
                              ? 'bg-accent text-white'
                              : 'bg-[#2a2a2a] text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('priority', 'urgent')}
                          className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                            formData.priority === 'urgent'
                              ? 'bg-[#ff6b35] text-white'
                              : 'bg-[#2a2a2a] text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          🔥 Urgent
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-700 flex gap-3">
                    <button
                      type="button"
                      onClick={handleDeleteTask}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default TaskDrawer;