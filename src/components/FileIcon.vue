<template>
  <div class="file-icon-container">
    <div :class="['file-icon', iconClass]">
      <span v-if="fileExtension" class="file-extension">{{ fileExtension }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'FileIcon',
  props: {
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const getFileExtension = (fileName: string) => {
      const parts = fileName.split('.');
      if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
      }
      return '';
    };

    const fileExtension = computed(() => {
      const type = props.fileType.toLowerCase();
      
      // Pour les types spécifiques, on n'affiche pas l'extension
      if (type.includes('pdf') || type.includes('word') || 
          type.includes('excel') || type.includes('powerpoint') ||
          type.includes('image')) {
        return '';
      }
      
      // Pour les autres types, on affiche l'extension
      const ext = getFileExtension(props.fileName);
      if (ext && ext.length <= 4) {
        return ext;
      }
      return '';
    });

    const iconClass = computed(() => {
      const fileName = props.fileName.toLowerCase();
      const type = props.fileType.toLowerCase();
      const ext = getFileExtension(fileName);

      // Déterminer la classe d'icône en fonction du type de fichier
      if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return 'image-icon';
      } else if (type.includes('pdf') || ext === 'pdf') {
        return 'pdf-icon';
      } else if (type.includes('word') || ['doc', 'docx'].includes(ext)) {
        return 'word-icon';
      } else if (type.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) {
        return 'excel-icon';
      } else if (type.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) {
        return 'powerpoint-icon';
      } else if (type.includes('zip') || ['zip', 'rar', '7z'].includes(ext)) {
        return 'zip-icon';
      } else if (type.includes('folder') || type.includes('directory')) {
        return 'folder-icon';
      } else if (type.includes('text') || ['txt', 'md'].includes(ext)) {
        return 'text-icon';
      } else {
        return 'generic-icon';
      }
    });

    return {
      iconClass,
      fileExtension
    };
  }
});
</script>

<style scoped>
.file-icon-container {
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}

.file-icon {
  width: 24px;
  height: 24px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 10px;
  font-weight: bold;
  color: white;
}

.file-extension {
  text-transform: uppercase;
  font-size: 8px;
}

/* Styles spécifiques pour chaque type de fichier */
.image-icon {
  background-color: #dd4b39;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px;
}

.pdf-icon {
  background-color: #dd4b39;
  position: relative;
}

.pdf-icon::before {
  content: "PDF";
  color: white;
  font-size: 8px;
  font-weight: bold;
}

.word-icon {
  background-color: #4285f4;
  position: relative;
}

.word-icon::before {
  content: "W";
  color: white;
  font-weight: bold;
}

.excel-icon {
  background-color: #0f9d58;
  position: relative;
}

.excel-icon::before {
  content: "X";
  color: white;
  font-weight: bold;
}

.powerpoint-icon {
  background-color: #f4b400;
  position: relative;
}

.powerpoint-icon::before {
  content: "P";
  color: white;
  font-weight: bold;
}

.folder-icon {
  background-color: #f1c40f;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px;
}

.zip-icon {
  background-color: #f4b400;
  position: relative;
}

.zip-icon::before {
  content: "ZIP";
  color: white;
  font-size: 7px;
  font-weight: bold;
}

.text-icon {
  background-color: #607d8b;
}

.generic-icon {
  background-color: #9e9e9e;
  position: relative;
}

.generic-icon::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px;
}
</style>
