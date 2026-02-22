const fs = require('fs');

const files = [
  'c:/React-Native/Football_Turf/app/auth/register.tsx',
  'c:/React-Native/Football_Turf/app/auth/login.tsx',
  'c:/React-Native/Football_Turf/app/(tabs)/explore.tsx',
  'c:/React-Native/Football_Turf/app/(tabs)/bookings.tsx',
  'c:/React-Native/Football_Turf/app/play/create-match.tsx',
  'c:/React-Native/Football_Turf/app/profile/edit.tsx',
  'c:/React-Native/Football_Turf/app/venue/[id].tsx',
  'c:/React-Native/Football_Turf/components/train/TrainTab.tsx',
  'c:/React-Native/Football_Turf/components/home/SearchModal.tsx',
  'c:/React-Native/Football_Turf/components/home/PlayTab.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
      console.log('Skipping ' + file + ' - does not exist.');
      return;
  }
  let code = fs.readFileSync(file, 'utf8');
  let originalCode = code;

  // Remove Moti mock or import
  code = code.replace(/const\s+MotiView\s*=\s*\(\{\s*children,\s*style\s*\}\s*:\s*any\s*\)\s*=>\s*<View\s+style=\{style\}>\{children\}<\/View>;\r?\n/g, '');
  code = code.replace(/const\s+AnimatePresence\s*=\s*\(\{\s*children\s*\}\s*:\s*any\s*\)\s*=>\s*<>\{children\}<\/>;\r?\n/g, '');
  code = code.replace(/import\s*\{\s*MotiView(,\s*AnimatePresence)?\s*\}\s*from\s*['\"]moti['\"];?\r?\n/g, '');
  code = code.replace(/import\s*\{\s*AnimatePresence(,\s*MotiView)?\s*\}\s*from\s*['\"]moti['\"];?\r?\n/g, '');

  if (code.includes('<Moti') || code.includes('<AnimatePresence')) {
    if (!code.includes('import Animated')) {
      code = code.replace(/import React(.*?)\s+from\s+['\"]react['\"];?\r?\n/, match => {
        return match + "import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, SlideInUp, SlideOutDown, FadeInLeft, FadeInRight, FadeInUp, FadeInDown } from \"react-native-reanimated\";\n";
      });
    }

    code = code.replace(/<AnimatePresence[^>]*>/g, '');
    code = code.replace(/<\/AnimatePresence>/g, '');
    
    const motiRegex = /<Moti(View|Text|Image)([^>]*)>/g;
    
    code = code.replace(motiRegex, (match, tag, propsString) => {
      let finalProps = propsString;
      
      let duration = 300;
      let delay = 0;
      const transMatch = propsString.match(/transition=\{\{.*?duration:\s*(\d+).*?\}\}/);
      if (transMatch) duration = parseInt(transMatch[1]);
      
      const delayMatch = propsString.match(/transition=\{\{.*?delay:\s*(\d+).*?\}\}/);
      if (delayMatch) delay = parseInt(delayMatch[1]);
      
      let enteringMethod = 'FadeIn';
      let exitingMethod = 'FadeOut';

      const fromMatch = propsString.match(/from=\{\{\s*([^}]+)\s*\}\}/);
      if (fromMatch) {
         let fromStr = fromMatch[1];
         if (fromStr.includes('scale:')) {
            enteringMethod = 'ZoomIn';
            exitingMethod = 'ZoomOut';
         }
         let ty = fromStr.match(/translateY:\s*([0-9.-]+)/);
         if (ty) {
            let val = parseFloat(ty[1]);
            if (val < 0) enteringMethod = 'FadeInDown'; // comes from above (-Y -> 0)
            else enteringMethod = 'FadeInUp'; // comes from below (+Y -> 0)
         }
         let tx = fromStr.match(/translateX:\s*([0-9.-]+)/);
         if (tx) {
            let val = parseFloat(tx[1]);
            if (val < 0) enteringMethod = 'FadeInLeft'; 
            else enteringMethod = 'FadeInRight';
         }
      }
      
      let enteringSuffix = `.duration(${duration})`;
      if (delay > 0) enteringSuffix += `.delay(${delay})`;
      
      finalProps = finalProps.replace(/from=\{\{.*?\}\}/g, '');
      finalProps = finalProps.replace(/animate=\{\{.*?\}\}/g, '');
      finalProps = finalProps.replace(/transition=\{\{.*?\}\}/g, '');
      
      return '<Animated.' + tag + ' entering={' + enteringMethod + enteringSuffix + '} exiting={' + exitingMethod + '.duration(200)} ' + finalProps + '>';
    });

    code = code.replace(/<\/Moti(View|Text|Image)>/g, '</Animated.$1>');
  }

  if (code !== originalCode) {
    fs.writeFileSync(file, code, 'utf8');
    console.log('Modified ' + file);
  }
});
console.log('Done!');
