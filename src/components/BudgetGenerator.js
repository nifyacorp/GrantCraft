import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import DocumentGenerator from '../lib/documentGenerator';

function BudgetGenerator({ 
  projectInfo, 
  contextData, 
  onSave, 
  onClose,
  initialContent = null
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [budget, setBudget] = useState(initialContent || null);
  const [categories, setCategories] = useState([
    { id: 'personnel', name: 'Personnel', items: [] },
    { id: 'equipment', name: 'Equipment', items: [] },
    { id: 'materials', name: 'Materials & Supplies', items: [] },
    { id: 'travel', name: 'Travel', items: [] },
    { id: 'other', name: 'Other Direct Costs', items: [] }
  ]);
  
  const [totalBudget, setTotalBudget] = useState({
    personnel: 0,
    equipment: 0,
    materials: 0,
    travel: 0,
    other: 0,
    total: 0
  });
  
  const [activeCategory, setActiveCategory] = useState('personnel');
  const [documentGenerator] = useState(new DocumentGenerator());
  const [duration, setDuration] = useState(projectInfo?.duration || '3 years');
  const [newItem, setNewItem] = useState({ name: '', cost: '', justification: '' });
  
  // Generate budget content when component mounts if not provided
  useEffect(() => {
    if (!budget && !isGenerating) {
      generateBudgetContent();
    } else if (budget) {
      // Parse existing budget content if it exists
      try {
        parseBudgetContent(budget.content);
      } catch (error) {
        console.error('Error parsing budget content:', error);
      }
    }
  }, [budget]);
  
  // Calculate totals whenever categories change
  useEffect(() => {
    const newTotals = {
      personnel: calculateCategoryTotal('personnel'),
      equipment: calculateCategoryTotal('equipment'),
      materials: calculateCategoryTotal('materials'),
      travel: calculateCategoryTotal('travel'),
      other: calculateCategoryTotal('other'),
      total: 0
    };
    
    newTotals.total = 
      newTotals.personnel + 
      newTotals.equipment + 
      newTotals.materials + 
      newTotals.travel + 
      newTotals.other;
    
    setTotalBudget(newTotals);
  }, [categories]);
  
  // Calculate total for a category
  const calculateCategoryTotal = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 0;
    
    return category.items.reduce((total, item) => total + parseFloat(item.cost || 0), 0);
  };
  
  // Parse budget content from text
  const parseBudgetContent = (content) => {
    // In a real implementation, this would parse the content and extract budget items
    // For now, we'll use a simple implementation
    
    const newCategories = [...categories];
    
    // Try to extract some items from the content
    const personnelRegex = /Personnel.*?:.*?\$([\d,]+).*?([\w\s]+).*?(\d+%)/gi;
    const personnelMatches = [...content.matchAll(personnelRegex)];
    
    if (personnelMatches.length > 0) {
      newCategories[0].items = personnelMatches.map(match => ({
        id: `personnel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: match[2].trim(),
        cost: parseFloat(match[1].replace(/,/g, '')),
        justification: `${match[3]} effort`
      }));
    }
    
    // Extract equipment items
    const equipmentRegex = /Equipment.*?:.*?\$([\d,]+).*?([\w\s\-]+)/gi;
    const equipmentMatches = [...content.matchAll(equipmentRegex)];
    
    if (equipmentMatches.length > 0) {
      newCategories[1].items = equipmentMatches.map(match => ({
        id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: match[2].trim(),
        cost: parseFloat(match[1].replace(/,/g, '')),
        justification: 'Required for research'
      }));
    }
    
    setCategories(newCategories);
  };
  
  // Generate budget content
  const generateBudgetContent = async () => {
    setIsGenerating(true);
    
    try {
      // Generate the budget document using DocumentGenerator
      const generatedBudget = await documentGenerator.generateSection(
        'budget',
        contextData || { messages: [], metadata: {} },
        {
          ...projectInfo,
          duration: duration
        } || { title: 'Research Project' }
      );
      
      setBudget(generatedBudget);
      
      // Parse the generated content to extract budget items
      parseBudgetContent(generatedBudget.content);
    } catch (error) {
      console.error('Error generating budget:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Add a new budget item
  const addBudgetItem = () => {
    if (!newItem.name || !newItem.cost) return;
    
    const updatedCategories = [...categories];
    const categoryIndex = updatedCategories.findIndex(c => c.id === activeCategory);
    
    if (categoryIndex === -1) return;
    
    updatedCategories[categoryIndex].items.push({
      id: `${activeCategory}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newItem.name,
      cost: parseFloat(newItem.cost),
      justification: newItem.justification || ''
    });
    
    setCategories(updatedCategories);
    setNewItem({ name: '', cost: '', justification: '' });
  };
  
  // Remove a budget item
  const removeBudgetItem = (categoryId, itemId) => {
    const updatedCategories = [...categories];
    const categoryIndex = updatedCategories.findIndex(c => c.id === categoryId);
    
    if (categoryIndex === -1) return;
    
    updatedCategories[categoryIndex].items = updatedCategories[categoryIndex].items.filter(
      item => item.id !== itemId
    );
    
    setCategories(updatedCategories);
  };
  
  // Update a budget item
  const updateBudgetItem = (categoryId, itemId, updates) => {
    const updatedCategories = [...categories];
    const categoryIndex = updatedCategories.findIndex(c => c.id === categoryId);
    
    if (categoryIndex === -1) return;
    
    const itemIndex = updatedCategories[categoryIndex].items.findIndex(
      item => item.id === itemId
    );
    
    if (itemIndex === -1) return;
    
    updatedCategories[categoryIndex].items[itemIndex] = {
      ...updatedCategories[categoryIndex].items[itemIndex],
      ...updates
    };
    
    setCategories(updatedCategories);
  };
  
  // Generate budget justification text
  const generateBudgetJustification = () => {
    let justification = `# Budget Justification for ${projectInfo?.title || 'Research Project'}\n\n`;
    justification += `## Duration: ${duration}\n\n`;
    justification += `## Total Budget: $${totalBudget.total.toLocaleString()}\n\n`;
    
    // Add each category
    categories.forEach(category => {
      if (category.items.length === 0) return;
      
      justification += `### ${category.name} - $${calculateCategoryTotal(category.id).toLocaleString()}\n\n`;
      
      category.items.forEach(item => {
        justification += `- **${item.name}**: $${parseFloat(item.cost).toLocaleString()}${item.justification ? ` - ${item.justification}` : ''}\n`;
      });
      
      justification += '\n';
    });
    
    return justification;
  };
  
  // Generate full budget document
  const generateFullBudgetDocument = () => {
    // Generate budget table in markdown format
    let budgetTable = `# Budget for ${projectInfo?.title || 'Research Project'}\n\n`;
    budgetTable += `Duration: ${duration}\n\n`;
    budgetTable += '| Category | Item | Cost | Justification |\n';
    budgetTable += '|----------|------|------|---------------|\n';
    
    // Add each budget item
    categories.forEach(category => {
      category.items.forEach(item => {
        budgetTable += `| ${category.name} | ${item.name} | $${parseFloat(item.cost).toLocaleString()} | ${item.justification || ''} |\n`;
      });
    });
    
    // Add category totals
    budgetTable += '|----------|------|------|---------------|\n';
    budgetTable += `| Personnel | | $${totalBudget.personnel.toLocaleString()} | |\n`;
    budgetTable += `| Equipment | | $${totalBudget.equipment.toLocaleString()} | |\n`;
    budgetTable += `| Materials & Supplies | | $${totalBudget.materials.toLocaleString()} | |\n`;
    budgetTable += `| Travel | | $${totalBudget.travel.toLocaleString()} | |\n`;
    budgetTable += `| Other | | $${totalBudget.other.toLocaleString()} | |\n`;
    budgetTable += '|----------|------|------|---------------|\n';
    budgetTable += `| **Total** | | **$${totalBudget.total.toLocaleString()}** | |\n\n`;
    
    // Add justification
    budgetTable += `\n## Budget Justification\n\n`;
    
    categories.forEach(category => {
      if (category.items.length === 0) return;
      
      budgetTable += `### ${category.name}\n\n`;
      
      category.items.forEach(item => {
        budgetTable += `- **${item.name}**: $${parseFloat(item.cost).toLocaleString()}${item.justification ? ` - ${item.justification}` : ''}\n`;
      });
      
      budgetTable += '\n';
    });
    
    return budgetTable;
  };
  
  // Save budget
  const handleSave = () => {
    if (onSave) {
      const budgetContent = generateFullBudgetDocument();
      
      // Create budget object
      const budgetData = {
        section: 'budget',
        title: `Budget for ${projectInfo?.title || 'Research Project'}`,
        content: budgetContent,
        categories: categories,
        totalBudget: totalBudget,
        duration: duration
      };
      
      onSave(budgetData);
    }
  };
  
  if (isGenerating) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-5/6 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-4/5 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
          </div>
          <p className="mt-6 text-muted-foreground">Generating budget...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle>Budget Generator</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Create and edit your project budget
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Duration:</span>
            <select
              className="text-sm border rounded px-2 py-1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="1 year">1 year</option>
              <option value="2 years">2 years</option>
              <option value="3 years">3 years</option>
              <option value="4 years">4 years</option>
              <option value="5 years">5 years</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 border-r pr-4">
            <h3 className="font-medium mb-4">Budget Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <div 
                  key={category.id}
                  className={`p-2 border rounded-md ${
                    activeCategory === category.id ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/20'
                  } cursor-pointer`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm">${calculateCategoryTotal(category.id).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.items.length} item{category.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium mb-2">Budget Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Personnel:</span>
                  <span>${totalBudget.personnel.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Equipment:</span>
                  <span>${totalBudget.equipment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Materials & Supplies:</span>
                  <span>${totalBudget.materials.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travel:</span>
                  <span>${totalBudget.travel.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Costs:</span>
                  <span>${totalBudget.other.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t mt-2">
                  <span>Total Budget:</span>
                  <span>${totalBudget.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full"
                onClick={generateBudgetContent}
                variant="outline"
              >
                Regenerate Budget
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="mb-6">
              <h3 className="font-medium mb-4">
                {categories.find(c => c.id === activeCategory)?.name || 'Category'} Items
              </h3>
              
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="text-left p-2">Item</th>
                      <th className="text-left p-2">Cost ($)</th>
                      <th className="text-left p-2">Justification</th>
                      <th className="w-16 p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.find(c => c.id === activeCategory)?.items.map(item => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">
                          <input
                            type="text"
                            className="w-full border-none p-1 bg-transparent"
                            value={item.name}
                            onChange={(e) => updateBudgetItem(activeCategory, item.id, { name: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            className="w-full border-none p-1 bg-transparent"
                            value={item.cost}
                            onChange={(e) => updateBudgetItem(activeCategory, item.id, { cost: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            className="w-full border-none p-1 bg-transparent"
                            value={item.justification || ''}
                            onChange={(e) => updateBudgetItem(activeCategory, item.id, { justification: e.target.value })}
                            placeholder="Justification"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeBudgetItem(activeCategory, item.id)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t">
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full border p-1 rounded"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          placeholder="New item name"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="w-full border p-1 rounded"
                          value={newItem.cost}
                          onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
                          placeholder="Cost"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full border p-1 rounded"
                          value={newItem.justification}
                          onChange={(e) => setNewItem({...newItem, justification: e.target.value})}
                          placeholder="Justification"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          className="text-green-500 hover:text-green-700 font-bold"
                          onClick={addBudgetItem}
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Budget Justification Preview</h3>
              <div className="border rounded-md p-3 bg-muted/10 max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                {generateBudgetJustification()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 p-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Total Budget: ${totalBudget.total.toLocaleString()}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
          >
            Save Budget
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default BudgetGenerator;