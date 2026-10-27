import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Projects } from '../services/api';
import { toast } from 'react-hot-toast';
import { Check, ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    skills: [],
    minBudget: '',
    maxBudget: '',
    milestones: []
  });
  
  const [skillInput, setSkillInput] = useState('');
  
  const steps = [
    { id: 1, name: 'Basic Info' },
    { id: 2, name: 'Skills & Budget' },
    { id: 3, name: 'Milestones' },
    { id: 4, name: 'Review' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { title: '', description: '', amount: '', dueDate: '' }]
    });
  };

  const updateMilestone = (index, field, value) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index][field] = value;
    setFormData({ ...formData, milestones: newMilestones });
  };

  const removeMilestone = (index) => {
    const newMilestones = formData.milestones.filter((_, i) => i !== index);
    setFormData({ ...formData, milestones: newMilestones });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills: formData.skills,
        budget: {
          min: Number(formData.minBudget),
          max: Number(formData.maxBudget)
        },
        milestones: formData.milestones.map(m => ({
          ...m,
          amount: Number(m.amount)
        }))
      };
      
      const res = await Projects.createProject(payload);
      toast.success('Project created successfully!');
      navigate(`/projects/${res.data.project.id || res.data.project._id}`);
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMilestoneAmount = formData.milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Indicator */}
        <nav aria-label="Progress" className="mb-12">
          <ol role="list" className="flex items-center">
            {steps.map((s, index) => (
              <li key={s.name} className={`relative pr-8 sm:pr-20 ${index === steps.length - 1 ? 'pr-0 sm:pr-0' : ''}`}>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className={`h-0.5 w-full ${step > s.id ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                </div>
                <a
                  href="#"
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                    step > s.id ? 'bg-indigo-600 hover:bg-indigo-900' :
                    step === s.id ? 'border-2 border-indigo-600 bg-white' :
                    'border-2 border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  {step > s.id ? (
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  ) : (
                    <span className={`h-2.5 w-2.5 rounded-full ${step === s.id ? 'bg-indigo-600' : 'bg-transparent'}`} aria-hidden="true" />
                  )}
                </a>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 w-max">
                  {s.name}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        {/* Form Content */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 mb-8">
          
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Build an E-commerce Website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {['Web Development', 'Mobile Development', 'Design', 'Writing', 'Data Science', 'Marketing', 'Consulting', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                  placeholder="Describe your project requirements in detail..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Skills & Budget</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="ml-1.5 text-indigo-500 hover:text-indigo-800">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillAdd}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Type a skill and press Enter (e.g. React, Node.js)"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Budget (₹)</label>
                  <input
                    type="number"
                    name="minBudget"
                    value={formData.minBudget}
                    onChange={handleChange}
                    className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Budget (₹)</label>
                  <input
                    type="number"
                    name="maxBudget"
                    value={formData.maxBudget}
                    onChange={handleChange}
                    className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Project Milestones</h2>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Milestone
                </button>
              </div>
              
              {formData.milestones.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm">No milestones added yet. Break your project into smaller chunks.</p>
                  <button type="button" onClick={addMilestone} className="mt-2 text-indigo-600 font-medium text-sm">Add First Milestone</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <h4 className="font-medium text-gray-900 mb-4">Milestone {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Design Mockups"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹)</label>
                            <input
                              type="number"
                              value={milestone.amount}
                              onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                              type="date"
                              value={milestone.dueDate}
                              onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-gray-500 text-sm">Total Milestone Amount:</span>
                    <span className={`font-bold text-lg ${totalMilestoneAmount > Number(formData.maxBudget) ? 'text-red-500' : 'text-gray-900'}`}>
                      ₹{totalMilestoneAmount}
                    </span>
                  </div>
                  {totalMilestoneAmount > Number(formData.maxBudget) && (
                    <p className="text-red-500 text-xs mt-1 text-right">Total exceeds maximum budget!</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Info</h3>
                    <button onClick={() => setStep(1)} className="text-indigo-600 text-sm font-medium">Edit</button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-medium text-gray-900">{formData.title}</p>
                    <p className="text-sm text-gray-500 mb-2">{formData.category}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.description}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Skills & Budget</h3>
                    <button onClick={() => setStep(2)} className="text-indigo-600 text-sm font-medium">Edit</button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {formData.skills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700">{s}</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-700">Budget Range: <strong>₹{formData.minBudget} - ₹{formData.maxBudget}</strong></p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
                    <button onClick={() => setStep(3)} className="text-indigo-600 text-sm font-medium">Edit</button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    {formData.milestones.map((m, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium text-gray-900">{m.title}</span>
                          <span className="text-gray-500 ml-2">Due: {m.dueDate}</span>
                        </div>
                        <span className="font-medium text-gray-900">₹{m.amount}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-sm">
                      <span>Total</span>
                      <span>₹{totalMilestoneAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || isSubmitting}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Back
          </button>
          
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(Math.min(4, step + 1))}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium flex items-center transition-colors"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-2.5 font-medium flex items-center disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Project'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
