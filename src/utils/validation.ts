
import { ExtractedItem } from '@/hooks/useUserAppState';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateExtractedItem = (item: Partial<ExtractedItem>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Title validation
  if (!item.title || item.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (item.title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
  } else if (item.title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Title must be less than 200 characters' });
  }

  // Description validation
  if (item.description && item.description.length > 1000) {
    errors.push({ field: 'description', message: 'Description must be less than 1000 characters' });
  }

  // Due date validation
  if (item.dueDate) {
    const dueDate = new Date(item.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push({ field: 'dueDate', message: 'Invalid due date format' });
    } else if (dueDate < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      errors.push({ field: 'dueDate', message: 'Due date cannot be in the past' });
    }
  }

  // Assignee validation
  if (item.assignee && item.assignee.trim().length > 100) {
    errors.push({ field: 'assignee', message: 'Assignee name must be less than 100 characters' });
  }

  // Type-specific validation
  if (item.type === 'contact') {
    if (item.description && !item.description.includes('@') && !item.description.match(/\d{3}/)) {
      errors.push({ field: 'description', message: 'Contact should include email or phone number' });
    }
  }

  return errors;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
