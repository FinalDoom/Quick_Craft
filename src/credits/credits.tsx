import './credits.scss';
import React from 'react';
import {FaGithub} from 'react-icons/fa';

export default function Credits() {
  return (
    <div className="credits">
      <a
        target="_blank"
        href={'https://github.com/FinalDoom/Quick_Craft/releases/tag/v' + '__buildVersion__'}
        className="credits__version-link"
        title={'Built on __buildDate__'}
      >
        {'v' + '__buildVersion__'}
      </a>
      <a target="_blank" href="https://github.com/FinalDoom/Quick_Craft/" className="credits__github-link">
        <FaGithub />
      </a>
    </div>
  );
}
