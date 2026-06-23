// ============================================================
// templateRegistry.js — Maps template IDs to components
// ============================================================

import ClassicTemplate   from './layouts/ClassicTemplate';
import ModernTemplate    from './layouts/ModernTemplate';
import ExecutiveTemplate from './layouts/ExecutiveTemplate';
import MinimalTemplate   from './layouts/MinimalTemplate';
import TechnicalTemplate from './layouts/TechnicalTemplate';

export const TEMPLATE_COMPONENTS = {
  classic:   ClassicTemplate,
  modern:    ModernTemplate,
  executive: ExecutiveTemplate,
  minimal:   MinimalTemplate,
  technical: TechnicalTemplate,
};

export { ClassicTemplate, ModernTemplate, ExecutiveTemplate, MinimalTemplate, TechnicalTemplate };
