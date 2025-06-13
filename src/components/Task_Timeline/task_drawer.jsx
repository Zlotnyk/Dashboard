import React, { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { X, Calendar, FileText, Flag, Clock } from 'lucide-react';

const TaskDrawer = ({ isOpen, task, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    status: 'Not started',
    priority: 'normal',
  });

  // Збереження позиції прокручування
  useEffect(() => {
    if (isOpen) {
      // Зберігаємо поточну позицію прокручування
      const scrollY = window.scrollY;
      // Блокуємо прокручування сторінки
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Відновлюємо прокручування при закритті
      return () => {
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        start: task.start ? task.start.toISOString().split('T')[0] : '',
        end: task.end ? task.end.toISOString().split('T')[0] : '',
        status: task.status || 'Not started',
        priority: task.priority || 'normal',
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task) return;

    const updatedTask = {
      ...task,
      title: formData.title,
      description: formData.description,
      start: new Date(formData.start),
      end: new Date(formData.end),
      status: formData.status,
      priority: formData.priority,
    };

    onSave(updatedTask);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
                        className="w-full px-3 py-3 bg-transparent border-none outline-none text-white placeholder-gray-400 focus:outline-none transition-colors"
                        placeholder="Enter task title..."
                        required
                      />
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
                        className="w-full px-3 py-3 bg-transparent border-none outline-none text-white placeholder-gray-400 focus:outline-none transition-colors resize-none"
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
                          className="w-full px-3 py-3 bg-transparent border-none outline-none text-white focus:outline-none transition-colors"
                          required
                        />
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
                          className="w-full px-3 py-3 bg-transparent border-none outline-none text-white focus:outline-none transition-colors"
                          required
                        />
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
                        className="w-full px-3 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="Not started">Not started</option>
                        <option value="In progress">In progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On hold">On hold</option>
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
                      onClick={onDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors"
                    >
                      Save Changes
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