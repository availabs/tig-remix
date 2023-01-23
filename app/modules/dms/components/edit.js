import React from 'react'
import { useTheme } from '../theme'
import get from 'lodash.get'

export default function Card({item, updateAttribute ,attributes, status}) {
	const theme = useTheme()
	
	return (
		<div key={item.id} className={get(theme,'card.wrapper', '')}>
			{status ? <div>{JSON.stringify(status)}</div> : ''}
			
				{Object.keys(attributes)
					.map((attrKey,i) => {
						let EditComp = attributes[attrKey].EditComp
						return(
							<div key={`${attrKey}-${i}`} className={get(theme,'card.row', '')}>  
								<div className={get(theme,'card.rowLabel', '')}>{attrKey}</div>
								<div className={get(theme,'card.rowContent', '')}> 
									<EditComp 
										key={`${attrKey}-${i}`} 
										value={item[attrKey]} 
										onChange={(v) => updateAttribute(attrKey, v)}
									/>
								</div>
							</div>
						)
					})
				}
				<button type='submit'> Save </button>
		</div>
	)	
}