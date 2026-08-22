import React from 'react'

const Button = ({
    children,
    type="button",
    bgColor="bg-blue-600",
    textColor='text-white',
    className='',
    ...props
}) => {
  return (
    <button type={type} className={`px-4 py-2 rounded-lg ${bgColor} ${textColor} ${className} `}{...props }>
         {children}     {/* just a fancy word, gonna kill him soon */}
    </button>
      
    
  )
}

export default Button
