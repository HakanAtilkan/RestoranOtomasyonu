import React from 'react';

function SidebarTree({ entities, selectedKey, onSelect }) {
  return (
    <nav className="tree">
      {entities.map((group) => (
        <div key={group.group} className="tree-group">
          <div className="tree-group-title">{group.group}</div>
          <ul>
            {group.items.map((item) => (
              <li
                key={item.key}
                className={item.key === selectedKey ? 'tree-item active' : 'tree-item'}
                onClick={() => onSelect(item)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default SidebarTree;

