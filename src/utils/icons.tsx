import React from 'react'

interface EmojiProps {
  emoji: string
  className?: string
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler
  title?: string
  [key: string]: unknown
}

/**
 * Renders an emoji
 * @param emoji The emoji character
 * @param props Additional props like className
 * @returns React element with the emoji
 */
export const renderEmoji = ({
  emoji,
  className = '',
  ...props
}: EmojiProps): React.ReactElement => {
  return (
    <span className={className} role="img" aria-label="emoji" {...props}>
      {emoji || '😀'}
    </span>
  )
}

/**
 * Legacy function to maintain compatibility with existing code
 * Now it just renders the emoji directly
 */
export const getIcon = (
  emoji: string,
  props: { className?: string; style?: React.CSSProperties } = {}
): React.ReactElement => {
  return renderEmoji({ emoji, ...props })
}
