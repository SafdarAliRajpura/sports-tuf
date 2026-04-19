import os

file_path = r"c:\React-Native\Football_Turf\app\venue\[id].tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the last });
last_brace_index = content.rfind('});')
if last_brace_index != -1:
    new_styles = """
    inlineMapBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        backgroundColor: 'rgba(0,255,0,0.05)', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: 'rgba(0,255,0,0.2)' 
    },
    inlineMapBtnText: { 
        color: '#00FF00', 
        fontSize: 10, 
        fontWeight: '900', 
        letterSpacing: 1 
    }
"""
    # Insert new styles before the last });
    updated_content = content[:last_brace_index] + new_styles + content[last_brace_index:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    print("Successfully updated the file with new styles.")
else:
    print("Could not find the end of the StyleSheet.")
